import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, ExternalLink, Download, Linkedin, Mail, Award, FileText, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type Resume = Database['public']['Tables']['resumes']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileResult, certificatesResult, resumeResult] = await Promise.all([
          supabase.from('profiles').select('*').limit(1),
          supabase.from('certificates').select('*').order('issue_date', { ascending: false }).limit(3),
          supabase.from('resumes').select('*').eq('is_active', true).maybeSingle(),
        ]);
  
        if (profileResult.data && profileResult.data.length > 0) {
          setProfile(profileResult.data[0]);
        }
  
        if (certificatesResult.data) {
          setCertificates(certificatesResult.data);
        }
  
        if (resumeResult.error) throw resumeResult.error;
        setActiveResume(resumeResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contacts').insert([
        {
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          read: false,
        },
      ]);

      if (error) throw error;

      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-primary-50">
          <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-[0.2]"></div>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-secondary-200 shadow-sm">
                <span className="text-sm font-medium text-secondary-600">Available for freelance work</span>
                <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-secondary-900">Hi, I'm </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                  {profile?.full_name || 'Your Name'}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-secondary-600 max-w-xl">
                {profile?.bio || 'A passionate full-stack developer crafting beautiful and functional web experiences.'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  as="a"
                  href="#contact"
                  size="lg"
                  className="bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600"
                >
                  Let's Talk
                </Button>
                {activeResume && (
                  <Button
                    as="a"
                    href={activeResume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="lg"
                    className="group"
                    rightIcon={<Download className="group-hover:translate-y-1 transition-transform" size={16} />}
                  >
                    Download Resume
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                {profile?.github_url && (
                  <a 
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={24} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
                {profile?.email && (
                  <a 
                    href={`mailto:${profile.email}`}
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={24} />
                  </a>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl transform rotate-6 blur opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-[500px] object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-secondary-100 flex items-center justify-center">
                    <p className="text-secondary-400 text-lg">Add your photo in profile settings</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <SectionHeader
            title="Certifications"
            subtitle="Professional certifications and achievements that demonstrate my expertise"
            centered
          />
          
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg animate-pulse h-96"
                ></div>
              ))
            ) : certificates.length > 0 ? (
              certificates.map((certificate) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {certificate.certificate_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={certificate.certificate_url}
                        alt={certificate.title}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-900">
                          {certificate.title}
                        </h3>
                        <p className="mt-2 text-secondary-600">
                          Issued by {certificate.issuer}
                        </p>
                      </div>
                      <Award className="text-primary-500" size={24} />
                    </div>
                    <div className="mt-4 text-sm text-secondary-500">
                      <p>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</p>
                      {certificate.expiry_date && (
                        <p>Expires: {new Date(certificate.expiry_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    {certificate.credential_url && (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        View Credential
                        <ExternalLink size={16} className="ml-1" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center">
                <p className="text-secondary-500">No certificates found.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Button
              as={Link}
              to="/certificates"
              variant="outline"
              size="lg"
              className="group"
              rightIcon={<ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />}
            >
              View All Certificates
            </Button>
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary-50">
        <div className="container">
          <SectionHeader
            title="Resume"
            subtitle="Download my resume to learn more about my experience and qualifications"
            centered
          />

          <div className="mt-12 max-w-3xl mx-auto">
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
                <div className="h-8 bg-secondary-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-secondary-200 rounded w-2/3 mb-6"></div>
                <div className="h-12 bg-secondary-200 rounded w-48"></div>
              </div>
            ) : activeResume ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-secondary-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-secondary-900">
                      {activeResume.title}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      Last updated: {new Date(activeResume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <FileText className="text-primary-500" size={32} />
                </div>
                <div className="mt-8">
                  <Button
                    as="a"
                    href={activeResume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<Download size={16} />}
                  >
                    Download Resume
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-500">No resume available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container">
          <SectionHeader
            title="Get in Touch"
            subtitle="Have a question or want to work together? I'd love to hear from you."
            centered
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-secondary-50 rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">Email</h4>
                      <p className="text-secondary-600">{profile?.email || 'contact@example.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Github className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">GitHub</h4>
                      <a
                        href={profile?.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 hover:text-primary-600 transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Linkedin className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">LinkedIn</h4>
                      <a
                        href={profile?.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 hover:text-primary-600 transition-colors"
                      >
                        Connect with me
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
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
      </section>
    </>
  );
}