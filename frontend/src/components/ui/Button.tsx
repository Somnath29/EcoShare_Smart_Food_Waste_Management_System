import React, { useRef } from 'react';
import type { MouseEvent } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * Premium reusable Button with a material ripple animation.
 * Supports primary (emerald gradient), secondary (glass-style), and ghost variants.
 * All native <button> attributes (type, disabled, onClick, …) are forwarded.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  onClick,
  disabled,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = buttonRef.current;
    if (button) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.28);
        transform: scale(0);
        transition: transform 350ms ease-out, opacity 350ms ease-out;
        pointer-events: none;
      `;
      button.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 400);
    }
    onClick?.(e);
  };

  const base =
    'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl font-semibold ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 ' +
    'transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 ' +
      'text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-700/80 ' +
      'text-zinc-700 dark:text-zinc-200 hover:bg-white/90 dark:hover:bg-zinc-800/60 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm',
    ghost:
      'bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20',
  };

  return (
    <button
      ref={buttonRef}
      // eslint-disable-next-line react/button-has-type
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
};
