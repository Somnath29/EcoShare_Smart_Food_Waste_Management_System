import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl"
      >
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Access Denied
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
          You do not have the required permissions or role validation to view this dashboard workspace.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-md rounded-xl transition-all"
          >
            Go to My Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
