import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
      
      {/* Visual background details */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center p-8 glass-card rounded-2xl z-10"
      >
        <span className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500">
          404
        </span>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-4 mb-2">
          Page Not Found
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
          The request URL does not match any route in the EcoShare workspace system. Please check your spelling and try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-md rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Safety
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
