import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Copy,
  Check,
  Github,
  Linkedin,
  MessageSquare,
  User,
  AtSign,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { PageHero } from '../../components/ui/page-hero';
import {
  generateCSRFToken,
  storeCSRFToken,
  getStoredCSRFToken,
} from '../../lib/csrf';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!getStoredCSRFToken()) storeCSRFToken(generateCSRFToken());
    (async () => {
      try {
        const { data } = await supabase.from('profiles').select('*').limit(1).single();
        if (data) setProfile(data as Profile);
      } catch (e) {
        console.error('profile fetch error', e);
      }
    })();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const csrfToken = getStoredCSRFToken();
      if (!csrfToken) throw new Error('CSRF token not found');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      toast.success('Message sent. I’ll get back to you soon.');
      reset();
    } catch (e) {
      console.error('contact error', e);
      toast.error(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmail = async () => {
    if (!profile?.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success('Email copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's build"
        highlight="something."
        subtitle="Have a project, a question, or want to chat about an internship? My inbox is open."
        size="sm"
      />

      <div className="container-page pb-24">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: contact info */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 surface p-6 sm:p-8"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
              Direct lines
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
              Reach me directly
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              Prefer email? Want to send a DM? Pick whatever works.
            </p>

            <div className="mt-6 space-y-3">
              {profile?.email && (
                <div className="group flex items-center justify-between gap-3 rounded-xl border border-secondary-200/70 dark:border-secondary-800/70 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                      <Mail size={17} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                        Email
                      </div>
                      <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                        {profile.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="grid h-9 w-9 place-items-center rounded-md text-secondary-600 dark:text-secondary-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-500/5"
                    aria-label="Copy email"
                  >
                    {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                </div>
              )}

              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 rounded-xl border border-secondary-200/70 dark:border-secondary-800/70 p-3.5 hover:border-brand-500/40 transition-colors"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-300 ring-1 ring-inset ring-accent-500/20">
                    <Phone size={17} />
                  </span>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                      Phone
                    </div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {profile.phone}
                    </div>
                  </div>
                </a>
              )}

              {profile?.location && (
                <div className="flex items-center gap-3 rounded-xl border border-secondary-200/70 dark:border-secondary-800/70 p-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary-200/70 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 ring-1 ring-inset ring-secondary-300/60 dark:ring-secondary-700">
                    <MapPin size={17} />
                  </span>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                      Location
                    </div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {profile.location}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hairline my-6" />

            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-3">
              Elsewhere
            </div>
            <div className="flex items-center gap-2">
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-500/40 transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={18} />
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-500/40 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              )}
            </div>

            <div className="mt-8 rounded-xl bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 p-3.5 text-sm">
              <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Currently accepting work
              </div>
              <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
                Average response time: within 24 hours.
              </p>
            </div>
          </motion.aside>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3 surface p-6 sm:p-8"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
              New message
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
              Send me a note
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  icon={<User size={13} />}
                  error={errors.name?.message}
                >
                  <input
                    {...register('name', { required: 'Required' })}
                    className="input"
                    placeholder="Your name"
                  />
                </Field>
                <Field
                  label="Email"
                  icon={<AtSign size={13} />}
                  error={errors.email?.message}
                >
                  <input
                    {...register('email', {
                      required: 'Required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email',
                      },
                    })}
                    type="email"
                    className="input"
                    placeholder="you@email.com"
                  />
                </Field>
              </div>

              <Field
                label="Subject"
                icon={<MessageSquare size={13} />}
                error={errors.subject?.message}
              >
                <input
                  {...register('subject', { required: 'Required' })}
                  className="input"
                  placeholder="Project, role, or topic"
                />
              </Field>

              <Field
                label="Message"
                icon={<MessageSquare size={13} />}
                error={errors.message?.message}
              >
                <textarea
                  {...register('message', { required: 'Required' })}
                  rows={6}
                  className="input"
                  placeholder="Tell me a bit about what you're working on…"
                />
              </Field>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={isSubmitting}
                rightIcon={!isSubmitting ? <Send size={15} /> : undefined}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Sending…' : 'Send message'}
              </Button>

              <p className="text-xs text-secondary-500 dark:text-secondary-500">
                By submitting, you agree to be contacted at the email you provide.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-secondary-600 dark:text-secondary-400 mb-1.5">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {error && (
          <span className="text-red-500 dark:text-red-400 normal-case font-sans tracking-normal">
            {error}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
