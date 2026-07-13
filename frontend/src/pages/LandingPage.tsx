import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../components/ui/Toast.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, HeartHandshake, Utensils, 
  Users, BarChart3, ChevronDown, ChevronUp, Send 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const features = [
    {
      icon: Utensils,
      title: "Kitchen Inventory Tracking",
      desc: "Kitchen staff quickly log excess cooked meals or raw ingredients before they spoil."
    },
    {
      icon: HeartHandshake,
      title: "Real-time NGO Requests",
      desc: "Verified local charities instantly receive alerts when food packages match their profiles."
    },
    {
      icon: Users,
      title: "Volunteer Coordination",
      desc: "Smart route optimization directs local volunteers for rapid delivery pickups."
    },
    {
      icon: BarChart3,
      title: "Analytical Dashboard",
      desc: "Detailed statistics highlighting carbon emission offset, meals rescued, and total cost saved."
    }
  ];

  const stats = [
    { value: "45K+", label: "Rescued Meals" },
    { value: "12.8 Tons", label: "CO2 Offset" },
    { value: "150+", label: "Verified NGOs" },
    { value: "98.2%", label: "Delivery Accuracy" }
  ];

  const testimonials = [
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
  ];

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'grid-bg-dark' : 'grid-bg-light'} overflow-hidden transition-colors duration-300`}>
      
      {/* Glow effects inspired by Stripe/Linear */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full mb-6"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              MERN Foundation Launched
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight max-w-4xl mx-auto mb-6"
          >
            Connecting excess meals with{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
              community hunger
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            A high-fidelity platform coordinating institutions, volunteers, and NGOs to track surplus, optimize rescue logistics, and save our environment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-950/15 rounded-xl transition-all group"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-xl transition-all"
            >
              Explore Solutions
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Designed for enterprise scalability
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Connecting kitchens, volunteers, and distribution channels with a clean unified interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => {
              const FeatIcon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                    <FeatIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="py-20 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="block text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                  {stat.value}
                </span>
                <span className="block text-zinc-400 text-sm font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Loved by community leaders
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Read how organizations rescue food daily with our system foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <div
                key={index}
                className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 bg-white/60 dark:bg-zinc-900/20 backdrop-blur-sm shadow-sm flex flex-col justify-between"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed mb-6">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    {test.author[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {test.author}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
      <section id="faq" className="py-20 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Clear information explaining the platform operations.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-zinc-500" /> : <ChevronDown className="h-5 w-5 text-zinc-500" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-zinc-150 dark:border-zinc-800"
                      >
                        <p className="p-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
      <section id="contact" className="py-20 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Get in Touch
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Need assistance? Send our team a message.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                rows={4}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Sending...</span>
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

    </div>
  );
};
