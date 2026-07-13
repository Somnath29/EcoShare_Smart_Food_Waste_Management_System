import React, { useEffect, useRef } from 'react';
import confettiLib from 'canvas-confetti';

interface ConfettiProps {
  /** When true, launch a burst of confetti */
  trigger: boolean;
  /** Number of simultaneous bursts (default 3) */
  count?: number;
  /** Called ~2 s after launch so the parent can reset trigger */
  onComplete?: () => void;
}

/**
 * Full-viewport confetti overlay.
 * Renders a fixed canvas with pointer-events: none, so it never blocks
 * interaction. Fires whenever `trigger` becomes true.
 */
export const Confetti: React.FC<ConfettiProps> = ({
  trigger,
  count = 3,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confettiLib.create(canvas, { resize: true, useWorker: true });

    const defaults = {
      spread: 70,
      startVelocity: 30,
      decay: 0.92,
      scalar: 1.1,
    };

    for (let i = 0; i < count; i++) {
      fire({
        ...defaults,
        particleCount: 90,
        origin: { x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.2 },
        colors: ['#10b981', '#34d399', '#6366f1', '#a78bfa', '#f59e0b', '#ffffff'],
      });
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2200);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};
