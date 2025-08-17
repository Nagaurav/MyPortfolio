import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './button';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number;
  bucket: string;
  folder: string;
  currentFile?: string;
  label?: string;
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  bucket,
  folder,
  currentFile,
  label = "Upload File",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      
      if (!file) return;
      
      // Validate file size
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      setUploading(true);

      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpload('');
  };

  const isImage = accept.includes('image');
  const isPDF = accept.includes('pdf');
  const isDoc = accept.includes('doc') || accept.includes('docx');

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
        {label}
      </label>
      
      <div className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
        error ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-secondary-300 bg-secondary-50 dark:border-secondary-600 dark:bg-secondary-800/50'
      }`}>
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept={accept}
          disabled={uploading}
        />
        
        <div className="text-center">
          {uploading ? (
            <div className="mx-auto h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          ) : (
            <>
              {isImage ? (
                <ImageIcon className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-500" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-500" />
              )}
            </>
          )}
          <div className="mt-4">
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              {uploading ? 'Uploading...' : (
                <>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span>
                  {' '}or drag and drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              {isImage && 'PNG, JPG, GIF up to 5MB'}
              {isPDF && 'PDF files up to 10MB'}
              {isDoc && 'DOC, DOCX files up to 5MB'}
              {!isImage && !isPDF && !isDoc && 'All file types supported'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {preview && isImage && (
        <div className="relative rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-600">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-secondary-800/80 dark:hover:bg-secondary-700"
            onClick={handleRemove}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {preview && (isPDF || isDoc) && (
        <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center space-x-3">
            <FileText size={20} className="text-secondary-400 dark:text-secondary-500" />
            <span className="text-sm text-secondary-600 dark:text-secondary-300">File uploaded successfully</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}