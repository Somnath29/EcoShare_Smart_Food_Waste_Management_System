import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../components/ui/Toast.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Confetti } from '../components/ui/Confetti';
import {
  ArrowRight, HeartHandshake, Utensils, Users,
  ChevronDown, ChevronUp, Globe, Sparkles,
  Flame, Award, Star, Shield, MapPin, Navigation, Zap,
  Binary, GitBranch, Layers, Search, Timer, Leaf,
  Building2, Truck, BarChart3, Play, CheckCircle2,
} from 'lucide-react';

/* ─── Scroll reveal wrapper ─── */
const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const offsets = {
    up: { y: 28, x: 0 },
    down: { y: -28, x: 0 },
    left: { y: 0, x: 28 },
    right: { y: 0, x: -28 },
  };
  const o = offsets[direction];
  return (
    <motion.div
      initial={{ opacity: 0, x: o.x, y: o.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── CountUp (scroll-triggered) ─── */
const CountUp: React.FC<{ value: number; decimals?: number; suffix?: string; duration?: number }> = ({
  value, decimals = 0, suffix = '', duration = 1800,
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasStarted(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration, hasStarted]);

  return (
    <div ref={ref} className="inline-block tabular-nums">
      {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </div>
  );
};

/* ─── Rotating dotted globe (canvas) ─── */
const DottedGlobe: React.FC<{ size?: number }> = ({ size = 240 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;
    const points: { x: number; y: number; z: number }[] = [];
    const numDots = 420;
    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(-1 + (2 * i) / numDots);
      const theta = Math.sqrt(numDots * Math.PI) * phi;
      points.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      });
    }

    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const radius = size * 0.82;
      const d = 2.4;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const cosX = Math.cos(0.22);
      const sinX = Math.sin(0.22);

      const rotated = points.map(p => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        return { x: x1, y: y2, z: z2 };
      }).sort((a, b) => b.z - a.z);

      rotated.forEach(p => {
        const scale = (d / (d + p.z)) * radius;
        const alpha = Math.max(0.1, (d - p.z) / (d + 1));
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, Math.max(1, (1.8 - p.z) * 1.6), 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark'
          ? `rgba(16, 185, 129, ${alpha})`
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.fill();
        if (p.z < 0) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#10b981';
          ctx.fillStyle = theme === 'dark' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(4, 120, 87, 0.7)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      ctx.restore();
      angle += 0.005;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [size, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full block filter drop-shadow-[0_0_32px_rgba(16,185,129,0.25)] pointer-events-none select-none"
    />
  );
};

/* ─── Floating particle network ─── */
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 85 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 2 + 0.8,
    }));
    let mouse = { x: -1000, y: -1000 };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dot = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
      const line = theme === 'dark' ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)';
      const mouseLine = theme === 'dark' ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.08)';

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = dot;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = line;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        if (mouse.x > 0) {
          const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dm < 200) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = mouseLine;
            ctx.lineWidth = (1 - dm / 200) * 1.2;
            ctx.stroke();
          }
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full" />;
};

/* ─── 3D floating food box ─── */
const FoodBox3D: React.FC<{
  size?: number;
  colorClass?: string;
  rotateSpeed?: number;
  delay?: number;
  icon?: React.ReactNode;
  label?: string;
}> = ({
  size = 68,
  colorClass = 'border-emerald-500/30 bg-emerald-500/8 dark:border-emerald-400/35 dark:bg-emerald-500/10',
  rotateSpeed = 16,
  delay = 0,
  icon,
  label,
}) => (
  <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size * 1.6, height: size * 1.6, perspective: '900px' }}>
    <motion.div
      animate={{ rotateX: [0, 360], rotateY: [0, 360], y: [0, -14, 0] }}
      transition={{
        rotateX: { duration: rotateSpeed, repeat: Infinity, ease: 'linear', delay },
        rotateY: { duration: rotateSpeed * 1.1, repeat: Infinity, ease: 'linear', delay },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className="relative"
      style={{ width: size, height: size, transformStyle: 'preserve-3d' }}
    >
      {[0, 180, -90, 90].map((_rotY, i) => (
        <div
          key={i}
          className={`absolute inset-0 border backdrop-blur-md rounded-xl flex flex-col items-center justify-center gap-1 ${colorClass}`}
          style={{
            transform: i === 0 ? `translateZ(${size / 2}px)` :
              i === 1 ? `rotateY(180deg) translateZ(${size / 2}px)` :
              i === 2 ? `rotateY(-90deg) translateZ(${size / 2}px)` :
              `rotateY(90deg) translateZ(${size / 2}px)`,
          }}
        >
          {i === 0 && icon}
          {i === 0 && label && (
            <span className="text-[7px] font-black uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">{label}</span>
          )}
        </div>
      ))}
      <div className={`absolute inset-0 border backdrop-blur-md rounded-xl ${colorClass}`} style={{ transform: `rotateX(90deg) translateZ(${size / 2}px)` }} />
      <div className={`absolute inset-0 border backdrop-blur-md rounded-xl ${colorClass}`} style={{ transform: `rotateX(-90deg) translateZ(${size / 2}px)` }} />
    </motion.div>
  </div>
);

/* ─── Mouse-tracking glow card ─── */
const GlowingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl transition-all duration-300 ${className}`}
    >
      {hovered && (
        <div
          className="absolute pointer-events-none rounded-full blur-[80px] opacity-100"
          style={{
            width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
            left: coords.x - 110, top: coords.y - 110,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ─── Section label ─── */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
    {children}
  </span>
);

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const location = useLocation();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mealsCount, setMealsCount] = useState(12000);
  const [activeOSRole, setActiveOSRole] = useState<'kitchen' | 'ngo' | 'volunteer' | 'student' | 'admin'>('kitchen');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeDsa, setActiveDsa] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 24,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast('error', 'Please fill in all the contact form fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast('success', 'Thank you! Your message has been sent successfully.', 'Message Sent');
      setContactName(''); setContactEmail(''); setContactMessage('');
      setShowConfetti(true);
    }, 1500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) { toast('error', 'Please provide a valid email address.'); return; }
    setIsSubmittingNewsletter(true);
    setTimeout(() => {
      setIsSubmittingNewsletter(false);
      toast('success', 'You have successfully subscribed to our newsletter updates!', 'Subscription Verified');
      setNewsletterEmail('');
      setShowConfetti(true);
    }, 1200);
  };

  const faqs = [
    { q: "How does the food redistribution match algorithm work?", a: "Our system uses a real-time matching pipeline. Surplus logs from dining halls are mapped against active NGO requirements, optimized using a custom Greedy Knapsack solver for fractional distribution and Dijkstra's algorithm for coordinate routing times." },
    { q: "Who can register on the platform?", a: "We support five distinct roles: Kitchen Staff (log surplus meals), NGOs (claim donations), Volunteers (coordinate package transit), Students (track waste reduction metrics and claim slots), and Admins (supervise system health)." },
    { q: "Is there any charge for NGOs using this system?", a: "No. EcoShare is a community redistribution project. The application and matching algorithms are free for all verified local NGOs, shelters, and volunteer riders." },
    { q: "How is food safety maintained during delivery?", a: "Kitchens define precise safe storage conditions and pickup timeframes. The algorithm calculates volunteer routes dynamically to verify pickup completion within these windows, ensuring fresh food delivery." },
  ];

  const testimonials = [
    { quote: "EcoShare transformed our campus kitchens. We went from discarding hundreds of pounds of quality food to feeding local families in need overnight. The matching efficiency is outstanding.", author: "Marcus Vance", role: "Lead Director, Central Campus Dining", stars: 5, avatar: "M" },
    { quote: "The live coordinate notifications allowed our NGO to collect fresh, hot meals within 25 minutes. We distribute these directly to families. Zero lag.", author: "Sarah Jenkins", role: "Operations Chief, Hope Food Project", stars: 5, avatar: "S" },
    { quote: "Delivering is extremely smooth. The Redistribution Map calculates the shortest route (Dijkstra algorithm) and ticks coordinate updates on the sidebar as I ride. Extremely premium experience.", author: "Dave K.", role: "Community Transport Volunteer", stars: 5, avatar: "D" },
  ];

  const timelineSteps = [
    { number: "01", title: "Kitchens Log Surplus", desc: "Kitchen staff enter surplus listings with quantity metrics, dietary labels (Veg/Non-Veg), and pickup time limits.", icon: Utensils, accent: "#10b981" },
    { number: "02", title: "Dynamic Claim Matching", desc: "Algorithm maps listings to local NGOs based on volume demand, proximity, and transport capacity, prompting instant reservations.", icon: Globe, accent: "#6366f1" },
    { number: "03", title: "Route Optimized Dispatch", desc: "Community volunteers pick up transit assignments. The navigation dashboard plots Dijkstra routes with real-time ETA countdowns.", icon: Users, accent: "#a855f7" },
    { number: "04", title: "Impact logged & visualised", desc: "Completed deliveries calculate carbon equivalents saved and update live telemetry counters, reinforcing regional carbon credits.", icon: HeartHandshake, accent: "#f59e0b" },
  ];

  const features = [
    { icon: Zap, title: 'Real-Time Matching', desc: 'Priority queues and greedy solvers match surplus to NGO demand in milliseconds.', color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: Navigation, title: 'Smart Routing', desc: "Dijkstra's algorithm computes optimal pickup-to-shelter transit paths.", color: 'text-indigo-500 bg-indigo-500/10' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Five dedicated dashboards for Kitchen Staff, NGOs, Students, Volunteers, and Admins.', color: 'text-sky-500 bg-sky-500/10' },
    { icon: BarChart3, title: 'Impact Analytics', desc: 'Live carbon diversion metrics, rescue timelines, and community scorecards.', color: 'text-amber-500 bg-amber-500/10' },
    { icon: Timer, title: 'Expiry Tracking', desc: 'Min-heap priority queues surface foods closest to expiration first.', color: 'text-rose-500 bg-rose-500/10' },
    { icon: Search, title: 'Instant Search', desc: 'Binary search delivers sub-linear food catalog lookups at scale.', color: 'text-purple-500 bg-purple-500/10' },
  ];

  const dsaShowcase = [
    { icon: Layers, name: 'Hash Map', tag: 'O(1) lookup', desc: 'Category distribution & kitchen workload indexing with collision chaining.', complexity: 'O(1) avg' },
    { icon: GitBranch, name: 'Min Heap', tag: 'Priority queue', desc: 'Expiry-sorted food inventory — root always holds the most urgent item.', complexity: 'O(log n)' },
    { icon: Navigation, name: 'Dijkstra', tag: 'Shortest path', desc: 'Campus graph routing from kitchen nodes to NGO destination hubs.', complexity: 'O((V+E) log V)' },
    { icon: Binary, name: 'Greedy Match', tag: 'Knapsack', desc: 'NGO batch selection maximizes rescued volume within vehicle capacity.', complexity: 'O(n log n)' },
    { icon: BarChart3, name: 'Merge Sort', tag: 'Stable sort', desc: 'Chronological waste analytics timelines with guaranteed O(n log n).', complexity: 'O(n log n)' },
    { icon: Search, name: 'Binary Search', tag: 'Catalog', desc: 'Logarithmic food listing search as the database grows.', complexity: 'O(log n)' },
  ];

  const ngoStats = [
    { value: 240, suffix: '+', label: 'Partner NGOs', desc: 'Verified shelters & food banks' },
    { value: 18, suffix: '', label: 'Campus Kitchens', desc: 'Active surplus logging nodes' },
    { value: 48950, suffix: '+', label: 'Meals Redirected', desc: 'Diverted from landfill this month' },
    { value: 99.7, suffix: '%', label: 'Match Precision', decimals: 1, desc: 'Algorithm routing accuracy' },
  ];

  const osRoles = [
    { id: 'kitchen' as const, role: 'Kitchen Staff', desc: 'Log surplus & set pickup windows', icon: Utensils },
    { id: 'ngo' as const, role: 'NGO Dispatch', desc: 'Query matched surplus listings', icon: Building2 },
    { id: 'volunteer' as const, role: 'Volunteer Fleet', desc: 'Optimum routing GPS coordinates', icon: Truck },
    { id: 'student' as const, role: 'Student Network', desc: 'Track waste savings & claim credits', icon: Star },
    { id: 'admin' as const, role: 'Admin Console', desc: 'Oversee user registry & logs audit', icon: Shield },
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'grid-bg-dark text-zinc-100' : 'grid-bg-light text-zinc-900'}`}>

      {/* Ambient layers */}
      <ParticleBackground />
      <div className="landing-aurora">
        <div className="landing-aurora-blob landing-aurora-blob-1" style={{ transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)` }} />
        <div className="landing-aurora-blob landing-aurora-blob-2" style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }} />
        <div className="landing-aurora-blob landing-aurora-blob-3" style={{ transform: `translate(${mousePos.x * 0.35}px, ${mousePos.y * 0.35}px)` }} />
        <div className="landing-noise" />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div
              className="lg:col-span-7 space-y-8 transition-transform duration-500 ease-out"
              style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }}
            >
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <SectionLabel>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Zero Waste Supply Engine
                </SectionLabel>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-black tracking-[-0.03em] leading-[1.02] text-zinc-950 dark:text-white"
              >
                Surplus food,{' '}
                <span className="landing-shimmer-text">delivered with purpose.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl font-light"
              >
                EcoShare connects campus kitchens, NGOs, and volunteers through intelligent matching — turning excess meals into community impact with zero organic waste.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/signup" className="inline-block">
                  <Button variant="primary" className="px-8 py-4 text-sm font-bold rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Start rescuing food <ArrowRight className="h-4 w-4 inline-block ml-1" />
                  </Button>
                </Link>
                <a href="#redistribution-os" className="inline-block">
                  <Button variant="secondary" className="px-8 py-4 text-sm font-semibold border border-zinc-200/80 dark:border-zinc-800/80 glass-panel rounded-2xl hover:scale-[1.02] active:scale-[0.98]">
                    <Play className="h-4 w-4 text-emerald-500 inline-block mr-1" />
                    See how it works
                  </Button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 pt-2"
              >
                {['JWT Secured', '5 Role Dashboards', '8 DSA Algorithms'].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {badge}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <div
              className="lg:col-span-5 relative h-[480px] flex items-center justify-center transition-transform duration-500 ease-out"
              style={{ transform: `translate(${mousePos.x * -0.18}px, ${mousePos.y * -0.18}px)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 rounded-full blur-3xl" />
              <div className="z-10 relative landing-float">
                <DottedGlobe size={250} />
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 400">
                <path d="M 120 100 Q 200 150 280 300" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 320 120 Q 200 220 80 280" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                <motion.circle r="4" fill="#10b981">
                  <animateMotion path="M 120 100 Q 200 150 280 300" dur="4s" repeatCount="indefinite" />
                </motion.circle>
                <motion.circle r="3" fill="#6366f1">
                  <animateMotion path="M 320 120 Q 200 220 80 280" dur="5.5s" repeatCount="indefinite" />
                </motion.circle>
              </svg>

              <div className="absolute top-2 left-4 z-20 landing-float-delayed">
                <FoodBox3D size={58} icon={<Utensils className="h-5 w-5 text-emerald-500" />} label="Meals" rotateSpeed={14} />
              </div>
              <div className="absolute bottom-6 right-2 z-20">
                <FoodBox3D size={72} colorClass="border-indigo-500/30 bg-indigo-500/8 dark:border-indigo-400/35 dark:bg-indigo-500/10" icon={<Leaf className="h-5 w-5 text-indigo-400" />} label="Fresh" rotateSpeed={18} delay={1.2} />
              </div>
              <div className="absolute top-[55%] -left-2 z-20 landing-float">
                <FoodBox3D size={48} colorClass="border-amber-500/25 bg-amber-500/8 dark:border-amber-400/30 dark:bg-amber-500/10" icon={<Sparkles className="h-4 w-4 text-amber-500" />} label="Rescue" rotateSpeed={12} delay={0.6} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATISTICS ═══ */}
      <section id="statistics" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-zinc-950 dark:bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_65%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal className="text-center mb-14">
            <SectionLabel><BarChart3 className="h-3 w-3" /> Live Impact Telemetry</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
              Real numbers. Real rescue.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: 48950, label: 'Meals Diverted Today', suffix: '+' },
              { value: 14.8, label: 'Tons Methane Averted', suffix: ' t', decimals: 1 },
              { value: 240, label: 'Rescue Partner NGOs', suffix: '+' },
              { value: 99.7, label: 'Route Match Precision', suffix: '%', decimals: 1 },
            ].map((stat, idx) => (
              <Reveal key={idx} delay={idx * 0.08}>
                <div className="landing-stat-glass rounded-2xl p-6 md:p-8 text-center group hover:border-emerald-500/30 transition-colors">
                  <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-teal-200 to-indigo-300 tracking-tight">
                    <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </span>
                  <span className="block mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    {stat.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES (Bento) ═══ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <SectionLabel><Sparkles className="h-3 w-3" /> Platform Features</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Built for every stakeholder
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-light leading-relaxed">
              From kitchen surplus logging to NGO dispatch — every workflow is engineered for speed, clarity, and impact.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={idx * 0.06}>
                  <div className="landing-bento-card interactive-card rounded-2xl p-7 h-full group cursor-default">
                    <div className={`inline-flex p-3 rounded-xl ${f.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ DSA SHOWCASE ═══ */}
      <section id="dsa-showcase" className="relative py-24 md:py-32 border-y border-zinc-200/50 dark:border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <SectionLabel><Binary className="h-3 w-3" /> DSA Engine Preview</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Algorithms powering rescue
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              Eight core data structures and algorithms drive matching, routing, and analytics — visualized live in every dashboard.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-2">
              {dsaShowcase.map((algo, idx) => {
                const Icon = algo.icon;
                const active = activeDsa === idx;
                return (
                  <button
                    key={algo.name}
                    onClick={() => setActiveDsa(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                      active
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                        : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/30 dark:bg-zinc-900/20'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">{algo.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{algo.complexity}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">{algo.tag}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              <GlowingCard className="min-h-[320px] border-emerald-500/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDsa}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">Algorithm Visualizer</span>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{dsaShowcase[activeDsa].name}</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                        {dsaShowcase[activeDsa].complexity}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                      {dsaShowcase[activeDsa].desc}
                    </p>
                    <div className="p-5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 font-mono text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                      <div className="flex gap-2"><span className="text-emerald-500">→</span> Step-by-step animation in dashboard</div>
                      <div className="flex gap-2"><span className="text-indigo-500">→</span> Play / pause / replay controls</div>
                      <div className="flex gap-2"><span className="text-amber-500">→</span> Real-world EcoShare use case mapping</div>
                    </div>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all"
                    >
                      Explore in DSA Learning tab
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </GlowingCard>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REDISTRIBUTION OS ═══ */}
      <section id="redistribution-os" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <SectionLabel><Layers className="h-3 w-3" /> Redistribution OS</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              One platform, five consoles
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              Role-based dashboards equipped with routing visualizers, inventory lifespan tracking, and active claims directories.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {osRoles.map((r) => {
                const Icon = r.icon;
                const active = activeOSRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveOSRole(r.id)}
                    className={`shrink-0 lg:shrink w-full min-w-[220px] text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                      active
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-md'
                        : 'border-zinc-200/80 dark:border-zinc-800/80 glass-panel hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{r.role}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8">
              <GlowingCard className="min-h-[360px] border-emerald-500/15">
                <AnimatePresence mode="wait">
                  {activeOSRole === 'kitchen' && (
                    <motion.div key="k" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-black text-emerald-500 tracking-wider font-mono">KITCHEN CONSOLE</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold">ONLINE</span>
                      </div>
                      <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Log Food Surplus Package</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[{ l: 'Food Item', v: 'Surplus Rice & Mixed Curry' }, { l: 'Quantity', v: '30 kg' }].map((f) => (
                          <div key={f.l} className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{f.l}</span>
                            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{f.v}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500">Auto-matches using priority queue heap sorting.</p>
                    </motion.div>
                  )}
                  {activeOSRole === 'ngo' && (
                    <motion.div key="n" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-black text-indigo-500 tracking-wider font-mono">NGO DISPATCH</span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] font-bold">2 ACTIVE CLAIMS</span>
                      </div>
                      <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Surplus Matches (5km Proximity)</h4>
                      {['Gordon Dining Hall Cooked Rice — 40 kg', 'Union Cafe Baked Croissants — 120 units'].map((item, i) => (
                        <div key={item} className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {i === 0 ? 'COLLECTING' : 'AVAILABLE'}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {activeOSRole === 'volunteer' && (
                    <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-black text-purple-500 tracking-wider font-mono">VOLUNTEER FLEET</span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full text-[9px] font-bold">DIJKSTRA SOLVER</span>
                      </div>
                      <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Active Redistributor Routing</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          { l: 'Pickup', v: 'Gordon Dining Hall', icon: MapPin, c: 'text-emerald-500' },
                          { l: 'Destination', v: 'Shelter House Care', icon: Navigation, c: 'text-indigo-500' },
                          { l: 'ETA', v: '12 min', icon: Timer, c: 'text-emerald-500' },
                        ].map((n) => (
                          <div key={n.l} className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{n.l}</span>
                            <span className={`flex items-center gap-1 text-sm font-bold mt-1 ${n.c}`}>
                              <n.icon className="h-3.5 w-3.5" /> {n.v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeOSRole === 'student' && (
                    <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-black text-amber-500 tracking-wider font-mono">STUDENT NETWORK</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-bold">IMPACT CREDIT</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ v: '124', l: 'Meals Rescued' }, { v: '34.7 kg', l: 'CO₂ Prevented', c: 'text-emerald-500' }, { v: '920 pt', l: 'Community Points', c: 'text-indigo-500' }].map((s) => (
                          <div key={s.l} className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
                            <span className={`block text-xl font-black font-mono ${s.c || 'text-zinc-900 dark:text-white'}`}>{s.v}</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase">{s.l}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeOSRole === 'admin' && (
                    <motion.div key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-black text-rose-500 tracking-wider font-mono">ADMIN PANEL</span>
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-bold">SYSTEM ROOT</span>
                      </div>
                      {[
                        { l: 'Node Latency', v: '14 ms OPTIMAL' },
                        { l: 'Database Integrity', v: '100% SECURE' },
                        { l: 'CPU Load', v: '12% LOAD' },
                      ].map((row) => (
                        <div key={row.l} className="flex justify-between text-sm">
                          <span className="text-zinc-500">{row.l}</span>
                          <span className="font-mono font-bold text-emerald-500">{row.v}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowingCard>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section id="how-it-works" className="relative py-24 md:py-32 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <SectionLabel><Navigation className="h-3 w-3" /> Workflow Pipeline</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              How redistribution works
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              A precision coordination pipeline connecting food supply surplus with neighborhood demand.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px landing-timeline-line z-0" />
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={idx * 0.1}>
                  <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4 group">
                    <div
                      className="h-16 w-16 rounded-2xl glass-panel flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
                      style={{ boxShadow: `0 0 0 1px ${step.accent}25` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: step.accent }} />
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] font-mono">{step.number}</span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light max-w-xs">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ NGO IMPACT ═══ */}
      <section id="ngo-impact" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-indigo-500/[0.04]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <SectionLabel><Building2 className="h-3 w-3" /> NGO Impact Network</SectionLabel>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                Empowering shelters to feed more communities
              </h2>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                Verified NGOs receive real-time surplus alerts, bulk donation matching, and optimized pickup routes — completely free of charge.
              </p>
              <ul className="mt-8 space-y-4">
                {['Instant bulk claim matching within 5km radius', 'Greedy knapsack solver for vehicle capacity', 'Live transit map with Dijkstra routing', 'Zero platform fees for verified partners'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02]">
                Register your NGO
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="grid grid-cols-2 gap-4">
              {ngoStats.map((s, idx) => (
                <Reveal key={s.label} delay={idx * 0.08}>
                  <div className="landing-bento-card rounded-2xl p-6 text-center">
                    <span className="block text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                    </span>
                    <span className="block mt-1 text-sm font-bold text-zinc-900 dark:text-white">{s.label}</span>
                    <span className="block mt-0.5 text-[10px] text-zinc-400">{s.desc}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ENVIRONMENTAL IMPACT ═══ */}
      <section id="environmental-impact" className="relative py-24 md:py-32 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-5 space-y-6">
              <SectionLabel><Globe className="h-3 w-3" /> Environmental Impact</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                Simulate your ecological rescue savings
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                Calculate the immediate positive impact your dining hall, cafe, or grocery store can produce by preventing organic decomposition in local landfills.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  { icon: Flame, text: 'Diverts methane emission production', color: 'text-emerald-500 bg-emerald-500/10' },
                  { icon: Award, text: 'Generates instant carbon offset reports', color: 'text-indigo-500 bg-indigo-500/10' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.color}`}><item.icon className="h-4 w-4" /></div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={0.1}>
              <GlowingCard className="border-emerald-500/20">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Meals Diverted</span>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      {mealsCount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                    <span>1,000 meals</span>
                    <span>100,000 meals</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  {[
                    { l: 'CO₂ Prevented', v: `${(mealsCount * 0.28).toFixed(1)} kg` },
                    { l: 'Car Miles Offset', v: `${(mealsCount * 0.72).toFixed(1)} mi` },
                    { l: 'Fresh Water Saved', v: `${(mealsCount * 45).toLocaleString()} gal`, highlight: true },
                  ].map((o) => (
                    <div key={o.l}>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{o.l}</span>
                      <span className={`text-xl font-black font-mono mt-1 block ${o.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>{o.v}</span>
                    </div>
                  ))}
                </div>
              </GlowingCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <SectionLabel><Star className="h-3 w-3" /> Testimonials</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Trusted by campus leaders
            </h2>
          </Reveal>

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 mb-10">
            {testimonials.map((t, idx) => (
              <Reveal key={t.author} delay={idx * 0.1}>
                <div className="landing-bento-card rounded-2xl p-7 h-full flex flex-col justify-between">
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[...Array(t.stars)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light italic flex-grow">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{t.author}</h4>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Mobile slider */}
          <div className="md:hidden max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="landing-bento-card rounded-2xl p-8"
              >
                <p className="text-base italic text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-black text-emerald-500">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{testimonials[activeTestimonial].author}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${activeTestimonial === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-300 dark:bg-zinc-700'}`}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative py-24 md:py-32 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-14 space-y-4">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Frequently asked questions
            </h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div className={`rounded-2xl border overflow-hidden transition-colors duration-300 ${open ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-zinc-200/80 dark:border-zinc-800/80 glass-panel'}`}>
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="faq-header w-full flex justify-between items-center p-5 text-left font-bold text-zinc-900 dark:text-white hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                    >
                      <span className="text-sm pr-4">{faq.q}</span>
                      {open ? <ChevronUp className="h-4 w-4 text-emerald-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA + CONTACT ═══ */}
      <section id="contact" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Premium CTA */}
            <Reveal className="lg:col-span-6">
              <div className="relative h-full flex flex-col justify-between overflow-hidden rounded-3xl p-8 sm:p-10 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
                <div className="relative z-10 space-y-5">
                  <SectionLabel><Zap className="h-3 w-3" /> Join EcoShare Today</SectionLabel>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
                    Ready to minimize dining food waste?
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-md">
                    Join hundreds of campus kitchen directors, volunteer riders, and community food pantries building local waste redistribution loops.
                  </p>
                </div>
                <div className="relative z-10 flex flex-wrap gap-3 pt-8">
                  <Link to="/signup" className="px-6 py-3.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg">
                    Create Your Free Account
                  </Link>
                  <Link to="/login" className="px-6 py-3.5 glass-panel font-bold rounded-xl text-sm text-zinc-600 dark:text-zinc-300 hover:scale-[1.02] transition-all">
                    Log In
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Contact form */}
            <Reveal className="lg:col-span-6" delay={0.1}>
              <GlowingCard className="h-full">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Get in touch</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {[
                    { label: 'Full Name', type: 'text', value: contactName, set: setContactName, placeholder: 'Gordon Vance' },
                    { label: 'Email Address', type: 'email', value: contactEmail, set: setContactEmail, placeholder: 'gordon@example.com' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">{f.label}</label>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        required
                        className="w-full px-4 py-3 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                      rows={3}
                      required
                      className="w-full px-4 py-3 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending…' : <><span>Submit Message</span><ArrowRight className="h-4 w-4 inline-block ml-2" /></>}
                  </Button>
                </form>
              </GlowingCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="relative py-16 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">Redistribution updates to your inbox</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mt-1">Matching metrics, feature drops, and system audit logs.</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@organization.org"
                  required
                  className="flex-1 px-4 py-2.5 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingNewsletter}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold shrink-0 disabled:opacity-50"
                >
                  {isSubmittingNewsletter ? '…' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Confetti overlay — fires on newsletter / contact success */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};
