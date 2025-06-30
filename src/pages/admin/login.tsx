import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Key, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { Button } from '../../components/ui/button';

interface AuthFormData {
  email: string;
  password: string;
}

export function AdminLoginPage() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Add debugging
  useEffect(() => {
    console.log('AdminLoginPage mounted');
    setIsPageLoaded(true);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>();
  
  const onSubmit = async (data: AuthFormData) => {
    console.log('Form submitted:', data);
    setIsLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await signUp(data.email, data.password)
        : await signIn(data.email, data.password);
      
      if (error) {
        console.error('Auth error:', error);
        toast.error(isSignUp ? 'Registration failed' : 'Login failed', {
          description: error.message,
        });
      } else if (isSignUp) {
        toast.success('Registration successful', {
          description: 'Please check your email to verify your account.',
        });
        setIsSignUp(false);
        reset();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Show loading state while page is initializing
  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Simple background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
        <div className="absolute inset-0 bg-grid bg-[length:20px_20px] opacity-[0.15]"></div>
      </div>

      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-primary-200/30 dark:bg-primary-800/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-64 h-64 bg-primary-300/30 dark:bg-primary-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-dark-700/20">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary-600/10 dark:bg-primary-400/10 rounded-2xl flex items-center justify-center mb-6 relative">
              <motion.div
                className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/20 rounded-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              {isSignUp ? <UserPlus className="h-10 w-10 text-primary-600 dark:text-primary-400" /> : <Lock className="h-10 w-10 text-primary-600 dark:text-primary-400" />}
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-300">
              {isSignUp ? 'Sign up to create your portfolio' : 'Sign in to manage your portfolio'}
            </p>
          </motion.div>
          
          <motion.form 
            variants={itemVariants}
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-4 py-3 pl-10 border ${
                    errors.email ? 'border-red-300 dark:border-red-500' : 'border-secondary-300 dark:border-dark-600'
                  } rounded-lg shadow-sm placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm text-secondary-900 dark:text-white`}
                  placeholder="Enter your email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className={`appearance-none block w-full px-4 py-3 pl-10 border ${
                    errors.password ? 'border-red-300 dark:border-red-500' : 'border-secondary-300 dark:border-dark-600'
                  } rounded-lg shadow-sm placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm text-secondary-900 dark:text-white`}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: isSignUp ? {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    } : undefined
                  })}
                />
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-300"
                loading={isLoading}
                rightIcon={isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              >
                {isSignUp ? 'Sign up' : 'Sign in'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  reset();
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </motion.div>
          </motion.form>
          
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              This is for the admin dashboard only. If you're not the site owner, please go back to the{' '}
              <a 
                href="/" 
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                main site
              </a>
              .
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}