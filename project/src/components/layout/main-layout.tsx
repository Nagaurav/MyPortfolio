import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from './main-header';
import { MainFooter } from './main-footer';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          className="flex-grow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <MainFooter />
    </div>
  );
}