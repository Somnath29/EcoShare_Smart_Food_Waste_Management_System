import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/ui/Toast.js';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton.js';
import { motion } from 'framer-motion';
import { 
  User, ShieldAlert, Award, Calendar, BarChart, 
  MapPin, CheckCircle, Clock, Truck, FileSpreadsheet, Building2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Simulate loading dynamic dashboard elements (skeleton loader)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      toast('info', `Welcome back, ${user?.name}! Loading your custom space.`, 'Dashboard Loaded');
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, toast]);

  if (!user) return null;

  // Render role based cards and metrics
  const renderRoleDashboard = () => {
    switch (user.role) {
      case 'Kitchen Staff':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Surplus Logged</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">1,240 kg</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><FileSpreadsheet className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Pickup Listings</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">3 listings</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg"><Clock className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Completed Donations</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">18 rescues</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
                </div>
              </div>
            </div>
            
            {/* Action placeholders */}
            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/40 dark:bg-zinc-900/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Kitchen Business Operations</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                When business features are ready, you will be able to log leftovers, schedule regular pickups, and generate campus environmental reports.
              </p>
              <button disabled className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                Create Leftover Notification
              </button>
            </div>
          </div>
        );

      case 'NGO':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Received Rescues</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">48 donations</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><Building2 className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Requests</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">2 active</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg"><Clock className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Estimated Meals Served</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">1,920 meals</h3>
                  </div>
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg"><Award className="h-5 w-5" /></div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/40 dark:bg-zinc-900/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">NGO Distribution Desk</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                Redistribution details, logistics tracking, and local kitchen partnerships will display here when production features launch.
              </p>
              <button disabled className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                Post Food Request
              </button>
            </div>
          </div>
        );

      case 'Volunteer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Completed Routes</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">12 routes</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><Truck className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hours Contributed</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">24 hrs</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><Clock className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Assignments</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">1 pending</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg"><MapPin className="h-5 w-5" /></div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/40 dark:bg-zinc-900/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Volunteer Transit Board</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                Active food deliveries, routes mapping, and reward badges tracking dashboard will release in the business phase.
              </p>
              <button disabled className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                View Available Deliveries
              </button>
            </div>
          </div>
        );

      case 'Admin':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Platform Users</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">340 users</h3>
                  </div>
                  <div className="p-2 bg-zinc-500/10 text-zinc-650 dark:text-zinc-300 rounded-lg"><User className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Database Nodes Health</p>
                    <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">Optimal</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Flagged Incidents</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">0 active</h3>
                  </div>
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg"><ShieldAlert className="h-5 w-5" /></div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/40 dark:bg-zinc-900/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Central Admin Control Center</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                System configurations, user validation logs, database audits, and role modification utilities will load here.
              </p>
              <button disabled className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                View System Audits
              </button>
            </div>
          </div>
        );

      default: // Student
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Claims Redeemed</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">14 meals</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">My Campus Rank</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">#43</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg"><Award className="h-5 w-5" /></div>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Rescued Weight</p>
                    <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">5.8 kg</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><BarChart className="h-5 w-5" /></div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/40 dark:bg-zinc-900/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Student Hub</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                Active leftover distributions on campus, points redemption store, and carbon metrics tracking will unlock in the next phase.
              </p>
              <button disabled className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                Browse Campus Listings
              </button>
            </div>
          </div>
        );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'NGO': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
      case 'Kitchen Staff': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'Volunteer': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Header Skeleton loader */}
      {loading ? (
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2.5">
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* User profile details header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xl text-zinc-700 dark:text-zinc-300">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {user.name}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                {user.role} Workspace
              </span>
              <span className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Dynamic role workspace content */}
          {renderRoleDashboard()}
        </motion.div>
      )}
    </div>
  );
};
