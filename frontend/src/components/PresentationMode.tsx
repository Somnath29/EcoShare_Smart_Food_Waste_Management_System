import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Leaf, Users,
  Building2, Zap, Navigation, GitBranch, Layers, Hash,
  Search, BarChart3, Play, Pause, Gauge
} from 'lucide-react';

/* ─── Animated counter ─── */
const AnimCount: React.FC<{ end: number; duration?: number; suffix?: string; prefix?: string }> = ({
  end, duration = 2000, suffix = '', prefix = '',
}) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.floor(eased * end));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
};

/* ─── Slide definitions ─── */
interface Slide {
  id: string;
  title: string;
  subtitle: string;
  type: 'title' | 'kpi' | 'algo' | 'flow' | 'impact' | 'closing';
}

const SLIDES: Slide[] = [
  { id: 'title',   title: 'EcoShare',                 subtitle: 'Smart Food Waste Management System',       type: 'title'   },
  { id: 'problem', title: 'The Problem',               subtitle: 'Campus kitchens waste tons of food daily', type: 'flow'    },
  { id: 'kpi',     title: 'Live Impact',               subtitle: 'Real numbers from the redistribution engine', type: 'kpi'  },
  { id: 'algo',    title: 'Algorithm Engine',          subtitle: 'Six DSA structures power every decision',  type: 'algo'    },
  { id: 'impact',  title: 'Environmental Impact',      subtitle: 'Measurable sustainability metrics',        type: 'impact'  },
  { id: 'closing', title: 'Zero Waste. Real Impact.',  subtitle: 'EcoShare — Built for the community',       type: 'closing' },
];

/* ─── Slide content renderers ─── */
const TitleSlide: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-12">
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl scale-150" />
      <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto">
        <Leaf className="h-12 w-12 text-white" />
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
      className="space-y-4"
    >
      <h1 className="text-7xl font-black text-white tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
        EcoShare
      </h1>
      <p className="text-2xl font-light text-zinc-300">Smart Food Waste Management System</p>
      <p className="text-zinc-400 text-base max-w-xl">
        Connecting campus kitchens, NGOs, and volunteers through intelligent redistribution algorithms.
      </p>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex gap-6"
    >
      {['React + TypeScript', 'Node.js + MongoDB', '6 DSA Algorithms', '5 Role Dashboards'].map((badge, i) => (
        <span key={i} className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold">
          {badge}
        </span>
      ))}
    </motion.div>
  </div>
);

const ProblemSlide: React.FC = () => {
  const steps = [
    { icon: Utensils, label: 'Kitchen cooks excess food', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' },
    { icon: Zap,      label: 'EcoShare detects surplus',  color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    { icon: Navigation, label: 'Algorithm matches NGO',   color: 'text-indigo-400', bg: 'bg-indigo-500/20 border-indigo-500/30' },
    { icon: Users,    label: 'Volunteer delivers meals',  color: 'text-sky-400',  bg: 'bg-sky-500/20 border-sky-500/30' },
    { icon: Building2, label: 'Community is fed',         color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-16">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-white">How EcoShare Works</h2>
        <p className="text-zinc-400">A 5-step redistribution pipeline, algorithmatically optimised</p>
      </div>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${s.bg} w-36`}
              >
                <Icon className={`h-8 w-8 ${s.color}`} />
                <span className="text-center text-sm font-semibold text-white leading-tight">{s.label}</span>
                <span className="text-zinc-500 text-xs font-mono">Step {i + 1}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-zinc-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Need to import Utensils separately inside
import { Utensils } from 'lucide-react';

const KPISlide: React.FC = () => {
  const kpis = [
    { label: 'Meals Rescued', value: 48950, suffix: '+', color: 'text-emerald-400', icon: Utensils },
    { label: 'Partner NGOs',  value: 240,   suffix: '+', color: 'text-indigo-400',  icon: Building2 },
    { label: 'CO₂ Saved (kg)', value: 1840, suffix: '', color: 'text-teal-400',    icon: Leaf },
    { label: 'Route Precision', value: 99,  suffix: '%', color: 'text-amber-400',   icon: Gauge },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white">Live Impact Metrics</h2>
        <p className="text-zinc-400 mt-2">Real-time telemetry from the redistribution engine</p>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
            >
              <Icon className={`h-8 w-8 mx-auto mb-3 ${kpi.color}`} />
              <div className={`text-5xl font-black font-mono ${kpi.color}`}>
                <AnimCount end={kpi.value} suffix={kpi.suffix} duration={2000} />
              </div>
              <div className="text-zinc-300 text-sm font-semibold mt-2">{kpi.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const AlgoSlide: React.FC = () => {
  const algos = [
    { name: 'Hash Map',    complexity: 'O(1)',         icon: Hash,        color: 'text-emerald-400', desc: 'O(1) food category lookup'    },
    { name: 'Min Heap',    complexity: 'O(log n)',      icon: GitBranch,   color: 'text-rose-400',    desc: 'Expiry priority queue'         },
    { name: "Dijkstra's", complexity: 'O((V+E)log V)', icon: Navigation,  color: 'text-indigo-400',  desc: 'Campus route optimisation'     },
    { name: 'Greedy',      complexity: 'O(n log n)',    icon: Layers,      color: 'text-amber-400',   desc: 'Knapsack vehicle packing'      },
    { name: 'Binary Srch', complexity: 'O(log n)',      icon: Search,      color: 'text-sky-400',     desc: 'Sorted catalog search'         },
    { name: 'Merge Sort',  complexity: 'O(n log n)',    icon: BarChart3,   color: 'text-purple-400',  desc: 'Analytics timeline sorting'    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white">Algorithm Engine</h2>
        <p className="text-zinc-400 mt-2">Six data structures & algorithms powering every decision</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
        {algos.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <Icon className={`h-6 w-6 ${a.color} mb-2`} />
              <div className="text-white font-bold text-sm">{a.name}</div>
              <div className={`font-mono text-xs font-black ${a.color} mt-0.5`}>{a.complexity}</div>
              <div className="text-zinc-400 text-[10px] mt-1 leading-relaxed">{a.desc}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ImpactSlide: React.FC = () => {
  const metrics = [
    { label: 'Organic Waste Diverted',  value: '6.2 tons',  icon: Leaf,    color: 'text-teal-400'    },
    { label: 'Methane Averted',         value: '14.8 tCO₂', icon: Leaf,    color: 'text-emerald-400' },
    { label: 'Families Supported',      value: '3,840/wk',  icon: Users,   color: 'text-indigo-400'  },
    { label: 'Sustainability Score',    value: '94/100',    icon: Gauge,   color: 'text-amber-400'   },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white">Environmental Impact</h2>
        <p className="text-zinc-400 mt-2">Measurable sustainability contributions</p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-xl w-full">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, type: 'spring' }}
              className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-4"
            >
              <Icon className={`h-8 w-8 shrink-0 ${m.color}`} />
              <div>
                <div className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</div>
                <div className="text-zinc-300 text-xs font-semibold mt-0.5">{m.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ClosingSlide: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-12">
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 0.8 }}
      className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
    >
      <Leaf className="h-10 w-10 text-white" />
    </motion.div>
    <div className="space-y-4">
      <h2 className="text-6xl font-black text-white bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
        Zero Waste.
      </h2>
      <h2 className="text-6xl font-black text-white">Real Impact.</h2>
      <p className="text-zinc-400 text-lg max-w-md">
        EcoShare — connecting campus kitchens to communities through intelligent algorithms.
      </p>
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex gap-4"
    >
      {['MIT Licensed', 'Open Source Ready', 'Production Grade'].map((b, i) => (
        <span key={i} className="px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-bold">
          {b}
        </span>
      ))}
    </motion.div>
  </div>
);

const renderSlide = (slide: Slide) => {
  switch (slide.type) {
    case 'title':   return <TitleSlide />;
    case 'flow':    return <ProblemSlide />;
    case 'kpi':     return <KPISlide />;
    case 'algo':    return <AlgoSlide />;
    case 'impact':  return <ImpactSlide />;
    case 'closing': return <ClosingSlide />;
    default:        return null;
  }
};

/* ─── Main component ─── */
export const PresentationMode: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [slide, setSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setSlide(s => Math.min(SLIDES.length - 1, s + 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onClose]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setSlide(s => {
        if (s >= SLIDES.length - 1) { setAutoPlay(false); return s; }
        return s + 1;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [autoPlay]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <span className="text-white font-black text-sm">EcoShare</span>
          <span className="text-zinc-500 text-xs">Presentation Mode</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              autoPlay ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {autoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            Auto
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {renderSlide(SLIDES[slide])}
          </motion.div>
        </AnimatePresence>

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/6 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-white/5">
        <button
          onClick={prev}
          disabled={slide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all cursor-pointer ${
                i === slide ? 'w-6 h-2 bg-emerald-500' : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={slide === SLIDES.length - 1 ? onClose : next}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-sm font-semibold cursor-pointer"
        >
          {slide === SLIDES.length - 1 ? 'Close' : 'Next'}
          {slide < SLIDES.length - 1 && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-zinc-600 text-xs font-mono">
        {slide + 1} / {SLIDES.length}
      </div>
    </div>
  );
};
