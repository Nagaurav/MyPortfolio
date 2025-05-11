import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, Copy, Github, Linkedin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { generateCSRFToken, storeCSRFToken, getStoredCSRFToken } from '../../lib/csrf';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  useEffect(() => {
    if (!getStoredCSRFToken()) {
      const token = generateCSRFToken();
      storeCSRFToken(token);
    }
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
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('your.email@example.com');
      setCopiedEmail(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-[0.2]"></div>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-secondary-900">Let's </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                Connect
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              Have a question or want to work together? I'd love to hear from you
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Email</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-secondary-600">your.email@example.com</p>
                    <button
                      onClick={copyEmail}
                      className="ml-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                      aria-label="Copy email"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Phone</h3>
                  <a
                    href="tel:+15551234567"
                    className="text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <p className="text-secondary-600">San Francisco, CA</p>
                </div>
              </div>

              <div className="pt-6 border-t border-secondary-200">
                <h3 className="text-lg font-medium mb-4">Connect with me</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600 hover:bg-secondary-200 transition-colors"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://linkedin.com/in/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600 hover:bg-secondary-200 transition-colors"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 input"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 input"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-secondary-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="mt-1 input"
                  {...register('subject', { required: 'Subject is required' })}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 input"
                  {...register('message', { required: 'Message is required' })}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Send size={16} />}
                fullWidth
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}