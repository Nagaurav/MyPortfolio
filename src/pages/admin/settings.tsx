import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { FileUpload } from '../../components/ui/file-upload';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileFormData {
  full_name: string;
  email: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  avatar_url: string;
}

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const avatarUrl = watch('avatar_url');
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (selectError) throw selectError;

        if (profile) {
          reset(profile);
        } else {
          // Create initial profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: '',
              bio: '',
              github_url: '',
              linkedin_url: '',
              twitter_url: '',
              avatar_url: '',
            }]);

          if (insertError) throw insertError;

          reset({
            email: user.email || '',
            full_name: '',
            bio: '',
            github_url: '',
            linkedin_url: '',
            twitter_url: '',
            avatar_url: '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [reset]);
  
  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setValue('avatar_url', url);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Profile Settings"
        subtitle="Update your personal information and social media links"
      />
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Full Name
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="full_name"
                className="input pl-10"
                {...register('full_name', { required: 'Full name is required' })}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                type="email"
                id="email"
                className="input pl-10"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="mt-1 input"
              {...register('bio')}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <FileUpload
            onUpload={handleAvatarUpload}
            accept="image/*"
            bucket="avatars"
            folder="profile"
            currentFile={avatarUrl}
            label="Profile Image"
          />
          
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              GitHub URL
            </label>
            <div className="mt-1 relative">
              <input
                type="url"
                id="github_url"
                className="input pl-10"
                {...register('github_url')}
                placeholder="https://github.com/yourusername"
              />
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
            </div>
          </div>
          
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              LinkedIn URL
            </label>
            <div className="mt-1 relative">
              <input
                type="url"
                id="linkedin_url"
                className="input pl-10"
                {...register('linkedin_url')}
                placeholder="https://linkedin.com/in/yourusername"
              />
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
            </div>
          </div>
          
          <div>
            <label htmlFor="twitter_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Twitter URL
            </label>
            <div className="mt-1 relative">
              <input
                type="url"
                id="twitter_url"
                className="input pl-10"
                {...register('twitter_url')}
                placeholder="https://twitter.com/yourusername"
              />
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saving}
              className="px-8"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}