import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl">
          <Compass className="h-10 w-10 text-white" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-500">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-secondary-900 dark:text-white">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-4 text-secondary-600 dark:text-secondary-400">
          The link may be outdated, or the address might have a typo. Let&apos;s get you
          back to something that does exist.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="gradient"
            size="lg"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/')}
          >
            Back to home
          </Button>
          <Button
            variant="outline"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/projects')}
          >
            Browse projects
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
