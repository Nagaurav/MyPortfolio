import { useRef, useState } from 'react';
import { Image as ImageIcon, Star, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface MultiImageUploadProps {
  /** Ordered image URLs. The first entry is treated as the cover. */
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: string;
  folder: string;
  maxSize?: number;
  maxFiles?: number;
  label?: string;
}

export function MultiImageUpload({
  value,
  onChange,
  bucket,
  folder,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10,
  label = 'Images',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);

    const room = maxFiles - value.length;
    if (room <= 0) {
      setError(`You can attach at most ${maxFiles} images.`);
      resetInput();
      return;
    }

    const selected = files.slice(0, room);
    const skippedForCount = files.length - selected.length;

    const tooBig = selected.filter(f => f.size > maxSize).map(f => f.name);
    const notImages = selected.filter(f => !f.type.startsWith('image/')).map(f => f.name);
    const valid = selected.filter(f => f.size <= maxSize && f.type.startsWith('image/'));

    setUploading(true);
    setProgress({ done: 0, total: valid.length });

    const uploaded: string[] = [];
    const failed: string[] = [];

    // Sequential rather than parallel: keeps upload order deterministic, which
    // matters because index 0 becomes the cover image.
    for (const file of valid) {
      try {
        const ext = file.name.split('.').pop() ?? 'jpg';
        // crypto.randomUUID avoids the collisions Math.random() invites.
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      } catch (err) {
        console.error('Error uploading image:', err);
        failed.push(file.name);
      } finally {
        setProgress(p => (p ? { ...p, done: p.done + 1 } : p));
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);

    const problems: string[] = [];
    if (notImages.length) problems.push(`Not an image: ${notImages.join(', ')}`);
    if (tooBig.length) {
      problems.push(`Over ${maxSize / (1024 * 1024)}MB: ${tooBig.join(', ')}`);
    }
    if (failed.length) problems.push(`Upload failed: ${failed.join(', ')}`);
    if (skippedForCount > 0) {
      problems.push(`${skippedForCount} file(s) skipped -- limit is ${maxFiles}.`);
    }
    setError(problems.length ? problems.join(' ') : null);

    setUploading(false);
    setProgress(null);
    resetInput();
  };

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
          {label}
        </label>
        <span className="text-xs text-secondary-500 dark:text-secondary-400">
          {value.length}/{maxFiles}
        </span>
      </div>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          error
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
            : 'border-secondary-300 bg-secondary-50 dark:border-secondary-600 dark:bg-secondary-800/50'
        )}
      >
        <input
          type="file"
          ref={inputRef}
          multiple
          accept="image/*"
          onChange={handleFiles}
          disabled={uploading || value.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="text-center">
          {uploading ? (
            <div className="mx-auto h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          ) : (
            <ImageIcon className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-500" />
          )}
          <div className="mt-4">
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              {uploading && progress
                ? `Uploading ${progress.done}/${progress.total}...`
                : (
                  <>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      Click to upload
                    </span>{' '}
                    or drag and drop &mdash; you can select several at once
                  </>
                )}
            </p>
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              PNG, JPEG, JPG, GIF, WebP up to {maxSize / (1024 * 1024)}MB each
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {value.length > 0 && (
        <>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            The first image is the cover shown on project cards. Use the star to promote
            another image, or the arrows to reorder.
          </p>

          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((url, index) => (
              <li
                key={url}
                className="group relative rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-600"
              >
                {/* object-contain, not cover: these are usually screenshots, and
                    cropping them to a letterbox makes them unreadable. */}
                <a href={url} target="_blank" rel="noopener noreferrer" title="Open full size">
                  <img
                    src={url}
                    alt={`Project image ${index + 1}`}
                    className="w-full aspect-video object-contain bg-secondary-100 dark:bg-secondary-900"
                  />
                </a>

                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Star size={10} className="fill-current" />
                    Cover
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move image ${index + 1} earlier`}
                      className="rounded px-1.5 text-white text-xs hover:bg-white/20 disabled:opacity-30"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === value.length - 1}
                      aria-label={`Move image ${index + 1} later`}
                      className="rounded px-1.5 text-white text-xs hover:bg-white/20 disabled:opacity-30"
                    >
                      &rarr;
                    </button>
                  </div>

                  <div className="flex gap-1">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        aria-label={`Make image ${index + 1} the cover`}
                        className="rounded px-1.5 text-white hover:bg-white/20"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="rounded px-1.5 text-white hover:bg-white/20"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([])}
        >
          Remove all
        </Button>
      )}
    </div>
  );
}
