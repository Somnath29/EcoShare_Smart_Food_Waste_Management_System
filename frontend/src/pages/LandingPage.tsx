import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../components/ui/Toast.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, HeartHandshake, Utensils, Users, 
  ChevronDown, ChevronUp, Send, Globe, Sparkles, 
  Apple, Flame, Award, Coffee
} from 'lucide-react';

// Smooth Counter Component using requestAnimationFrame
const CountUp: React.FC<{ value: number; decimals?: number; suffix?: string; duration?: number }> = ({ 
  value, 
  decimals = 0, 
  suffix = '', 
  duration = 1500 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimeValue: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimeValue) startTimeValue = timestamp;
      const progress = Math.min((timestamp - startTimeValue) / duration, 1);
      setCount(progress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
};

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Impact Calculator state
  const [mealsCount, setMealsCount] = useState(5000);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 1500);
  };

  const faqs = [
    {
      q: "How does the food redistribution match algorithm work?",
      a: "Our system matches real-time surplus notifications from kitchen staff with verified local NGOs and volunteers based on proximity, transport capacity, and food type requirements, ensuring minimal turnaround time."
    },
    {
      q: "Who can register on the platform?",
      a: "We support five distinct roles: Students can track waste metrics or claim meals, Kitchen Staff can log leftovers, NGOs can request donations, Volunteers can deliver food packages, and Admins supervise operations."
    },
    {
      q: "Is there any charge for NGOs using this system?",
      a: "No, the redistribution system is completely free for verified NGOs and volunteers. Our goal is to reduce environmental waste and support food-insecure populations."
    },
    {
      q: "How is food safety maintained?",
      a: "Kitchen staff log preparation time and food items. The platform establishes strict pickup windows, and volunteers use food-grade transport guidelines to ensure freshness."
    }
  ];

  const timelineSteps = [
    {
      number: "01",
      title: "Kitchens Log Excess Surplus",
      desc: "Kitchen staff log excess hot meals, grocery raw inputs, or baked goods with pickup guidelines and timer limits.",
      icon: Utensils,
      color: "from-emerald-500 to-teal-500"
    },
    {
      number: "02",
      title: "Real-time NGO Notification",
      desc: "Local verified NGOs receive live coordinate matching based on bulk volume demand, food profiles, and local proximity.",
      icon: Globe,
      color: "from-sky-500 to-indigo-500"
    },
    {
      number: "03",
      title: "Volunteer Transit Coordination",
      desc: "Community volunteers sign up to transport food boxes safely using real-time maps directions and schedules.",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "04",
      title: "Zero Waste & Nourishment",
      desc: "Meals are delivered to distribution points, feeding food-insecure individuals and diverting organic waste from landfills.",
      icon: HeartHandshake,
      color: "from-amber-500 to-rose-500"
    }
  ];

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'grid-bg-dark text-zinc-50' : 'grid-bg-light text-zinc-900'} overflow-hidden transition-colors duration-300`}>
      
      {/* Animated Floating Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> EcoShare Smart Network V2.0
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-zinc-950 dark:text-zinc-50"
              >
                Connecting excess meals with{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  community hunger.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl"
              >
                EcoShare is an award-winning redistribution network connecting commercial kitchens with volunteers and NGOs. Zero waste. Zero hunger. Enterprise scale.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xl rounded-xl transition-all group cursor-pointer"
                >
                  Join the Rescue Network
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-zinc-650 hover:text-zinc-950 dark:text-zinc-355 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-xl transition-all cursor-pointer"
                >
                  How It Works
                </a>
              </motion.div>
            </div>

            {/* Right Column: 3D Floating Mock Cards */}
            <div className="lg:col-span-5 relative h-[450px] flex items-center justify-center">
              
              {/* Card 1: Cooked Meals */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-4 max-w-[240px] w-full p-5 backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/40 shadow-2xl rounded-2xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-extrabold uppercase tracking-wide">
                    Available
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Surplus Cooked Meals</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Gordon Dining Hall leftovers</p>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-bold text-zinc-500">
                  <span>Weight: 45 kg</span>
                  <span className="text-emerald-500">Claim Now</span>
                </div>
              </motion.div>

              {/* Card 2: Groceries & Fresh Inputs */}
              <motion.div
                animate={{ y: [-15, 5, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[180px] right-2 max-w-[240px] w-full p-5 backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/40 shadow-2xl rounded-2xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Apple className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-full text-[8px] font-extrabold uppercase tracking-wide">
                    Claimed
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Fresh Produce Apples</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Matched to Helping Hands NGO</p>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-bold text-zinc-500">
                  <span>Weight: 120 lbs</span>
                  <span className="text-indigo-500">In Transit</span>
                </div>
              </motion.div>

              {/* Card 3: Baked Items */}
              <motion.div
                animate={{ y: [5, -10, 5] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 left-12 max-w-[220px] w-full p-5 backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/40 shadow-2xl rounded-2xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Coffee className="h-4.5 w-4.5" />
                  </div>
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[8px] font-extrabold uppercase tracking-wide">
                    Collected
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">Artisan Croissants</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">Campus Cafe leftovers</p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Impact Counter Banner */}
      <section className="py-16 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 48320, label: "Rescued Meals Logged", suffix: "+" },
              { value: 14.2, label: "Metric Tons CO2 Offset", suffix: " t", decimals: 1 },
              { value: 180, label: "Verified Partner NGOs", suffix: "+" },
              { value: 99.4, label: "Redistribution Success", suffix: "%", decimals: 1 }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="block text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 tracking-tight">
                  <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </span>
                <span className="block text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section: "How EcoShare Works" */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Redistribution Logistics Redefined
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              A high-precision coordination pipeline connecting food supply surplus with neighborhood demand.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Connecting horizontal line for layout */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-rose-500/20 z-0" />

            {timelineSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 space-y-4 p-4"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${step.color} p-[1px] flex items-center justify-center shadow-lg`}>
                    <div className="h-full w-full bg-white dark:bg-zinc-950 rounded-[15px] flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                      <StepIcon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-405 uppercase tracking-widest">{step.number} // PROCESS STEP</span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{step.title}</h3>
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed max-w-xs">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}

          </div>

        </div>
      </section>

      {/* Interactive Carbon Calculator Section */}
      <section className="py-24 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                Simulate Your Ecological Rescue Savings 🌍
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Calculate the immediate positive impact your dining hall, cafe, or grocery store can produce by preventing organic decomposition in local dumpsters.
              </p>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Flame className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">Diverts methane emission production</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">Generates instant compliance tax reports</span>
                </div>
              </div>
            </div>

            {/* Right side interactive calculator card */}
            <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Meals Diverted</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {mealsCount.toLocaleString()} meals
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={mealsCount}
                  onChange={e => setMealsCount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-405 font-mono">
                  <span>500 MEALS</span>
                  <span>50,000 MEALS</span>
                </div>
              </div>

              {/* Outputs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-150 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">CO2 Diverted</span>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono">
                    {(mealsCount * 0.28).toFixed(1)} kg
                  </h4>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Car Miles Offset</span>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono">
                    {(mealsCount * 0.7).toFixed(1)} mi
                  </h4>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fresh Water Saved</span>
                  <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {(mealsCount * 45).toLocaleString()} gal
                  </h4>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Trusted by Campus & NGO Leaders
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Read stories from directors, chefs, and student volunteers participating in active redistribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "EcoShare transformed our campus kitchen. We went from throwing away hundreds of pounds of quality food to feeding families in need overnight.",
                author: "Marcus Vance",
                role: "Lead Chef, Central Campus"
              },
              {
                quote: "The real-time notification system allowed our NGO volunteers to collect hot meals within 30 minutes, feeding over 80 children daily.",
                author: "Sarah Jenkins",
                role: "Director, Hope Foundation"
              },
              {
                quote: "Delivering as a volunteer is extremely easy. The maps integration shows exact paths, and knowing the meals arrive fresh is incredibly rewarding.",
                author: "David K.",
                role: "Community Volunteer"
              }
            ].map((test, index) => (
              <div
                key={index}
                className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-md flex flex-col justify-between"
              >
                <p className="text-xs text-zinc-650 dark:text-zinc-350 italic leading-relaxed mb-6">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {test.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                      {test.author}
                    </h4>
                    <p className="text-[10px] text-zinc-450">
                      {test.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Answers to common operational questions regarding food security and logistics.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="text-sm">{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-zinc-500" /> : <ChevronDown className="h-4.5 w-4.5 text-zinc-500" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-zinc-150 dark:border-zinc-800"
                      >
                        <p className="p-5 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Get in Touch
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Have questions about certification, local partnerships, or dashboard set up? Drop us a line.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Gordon Vance"
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="gordon@example.com"
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                rows={4}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="py-12 border-t border-zinc-250 dark:border-zinc-800 bg-zinc-950 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">EcoShare Network</h4>
            <p className="leading-relaxed text-zinc-450">
              Connecting commercial dining halls and local restaurants with volunteers and NGOs to reduce hunger and offset emissions.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">Redistribution</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Kitchen Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">NGO Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Student Hub</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li><span className="cursor-pointer hover:text-white transition-colors">Food Donation Act</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">Environmental Support</h4>
            <p className="text-zinc-450 leading-relaxed mb-3">
              Get notified of carbon rescue milestones and volunteer drives.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 max-w-[150px] w-full"
              />
              <button
                onClick={() => toast('success', 'Subscribed to carbon rescue digests!')}
                className="px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500">
          <p>© 2026 EcoShare Smart Food Waste Management & Redistribution. All rights reserved.</p>
          <p className="font-semibold text-zinc-450 inline-flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> Built for Ecological Global Restoration
          </p>
        </div>
      </footer>

    </div>
  );
};
