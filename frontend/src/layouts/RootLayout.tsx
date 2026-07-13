import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  // Setup global premium ripple click effect for interactive elements
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Target interactive components: buttons, anchors, items with btn/card classes
      const btn = target.closest('.btn-ripple, button, [role="button"], a.inline-flex, .interactive-card, .timeline-card, .faq-header');
      if (!btn || btn.classList.contains('no-ripple')) return;

      // Ensure target is prepared as a relative container with hidden overflow
      if (!btn.classList.contains('ripple-container')) {
        btn.classList.add('ripple-container');
        const style = window.getComputedStyle(btn);
        if (style.position === 'static') {
          (btn as HTMLElement).style.position = 'relative';
        }
        if (style.overflow !== 'hidden') {
          (btn as HTMLElement).style.overflow = 'hidden';
        }
      }

      const circle = document.createElement('span');
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const radius = diameter / 2;
      const rect = btn.getBoundingClientRect();
      
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.transform = 'scale(0)';
      circle.style.pointerEvents = 'none';

      // Pick tint based on button style
      const isDarkBg = btn.classList.contains('bg-zinc-950') || 
                       btn.classList.contains('bg-zinc-900') || 
                       btn.classList.contains('bg-black') ||
                       btn.classList.contains('bg-emerald-600') ||
                       btn.classList.contains('bg-red-600') ||
                       btn.classList.contains('bg-red-700') ||
                       btn.classList.contains('bg-indigo-600') ||
                       btn.classList.contains('text-white') ||
                       btn.getAttribute('type') === 'submit';

      circle.style.backgroundColor = isDarkBg 
        ? 'rgba(255, 255, 255, 0.28)' 
        : 'rgba(16, 185, 129, 0.16)';
      
      circle.classList.add('ripple-effect');

      // Clear any older active ripples
      const existingRipple = btn.querySelector('.ripple-effect');
      if (existingRipple) {
        existingRipple.remove();
      }

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
