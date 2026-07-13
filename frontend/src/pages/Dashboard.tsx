import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/ui/Toast.js';
import { useTheme } from '../context/ThemeContext.js';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton.js';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  Treemap, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  User, ShieldAlert, Award, MapPin, CheckCircle, Clock, 
  FileSpreadsheet, Plus, Edit, Trash2, Search, SlidersHorizontal, 
  List, Grid, ChevronRight, ArrowLeft, LogOut, LayoutDashboard,
  Utensils, CalendarDays, Compass, Loader2, Play, Pause, RotateCcw, Zap, BookOpen,
  Activity, Wifi, Cpu, Server
} from 'lucide-react';
import { 
  getFoodsApi, 
  createFoodApi, 
  updateFoodApi, 
  deleteFoodApi,
  reserveFoodApi,
  cancelReservationApi,
  collectFoodApi,
  getUsersApi,
  updateUserRoleApi,
  deleteUserApi
} from '../services/api.js';

type TabView = 'overview' | 'listings' | 'add-food' | 'edit-food' | 'profile' | 'reservations' | 'users' | 'reports' | 'command_center' | 'transit_map' | 'dsa_learning' | 'analytics';

// Reusable progress ring
const ProgressRing: React.FC<{ percentage: number; label: string; colorClass?: string }> = ({ 
  percentage, 
  label, 
  colorClass = 'text-emerald-500' 
}) => {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
      <div className="relative h-20 w-20 flex-shrink-0">
        <svg className="h-full w-full transform -rotate-90">
          <circle
            className="text-zinc-100 dark:text-zinc-800"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            className={colorClass}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-zinc-900 dark:text-zinc-50 font-mono">
          {Math.round(percentage)}%
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{label}</h4>
        <p className="text-[11px] text-zinc-450 mt-1">Real-time target metric completion</p>
      </div>
    </div>
  );
};

// Reusable mini animated area chart
const MiniAreaChart: React.FC<{ data: number[]; title: string; subtitle: string; colorTheme?: 'emerald' | 'indigo' | 'sky' }> = ({ 
  data, 
  title, 
  subtitle, 
  colorTheme = 'emerald' 
}) => {
  const strokeColor = colorTheme === 'emerald' ? '#10b981' : colorTheme === 'indigo' ? '#6366f1' : '#0ea5e9';
  const fillColor = colorTheme === 'emerald' ? 'rgba(16,185,129,0.1)' : colorTheme === 'indigo' ? 'rgba(99,102,241,0.1)' : 'rgba(14,165,233,0.1)';
  
  const maxVal = Math.max(...data, 10);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 240;
    const y = 60 - (val / maxVal) * 45 - 5;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M 0,60 L ${points} L 240,60 Z`;
  const linePath = `M ${points}`;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{title}</h4>
        <p className="text-[11px] text-zinc-450 mt-0.5">{subtitle}</p>
      </div>
      <div className="mt-4 relative h-16 w-full overflow-hidden">
        <svg viewBox="0 0 240 60" className="w-full h-full" preserveAspectRatio="none">
          <path d={pathData} fill={fillColor} />
          <motion.path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
      </div>
    </div>
  );
};

// Reusable action activity timeline
const ActivityTimeline: React.FC<{ items: Array<{ title: string; time: string; desc: string; icon: any; colorClass: string }> }> = ({ items }) => {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-5 flex items-center gap-1.5">
        <Clock className="h-4.5 w-4.5 text-zinc-500" /> Recent Actions
      </h3>
      <div className="relative pl-6 border-l border-zinc-150 dark:border-zinc-800 space-y-6">
        {items.map((item, idx) => {
          const ItemIcon = item.icon;
          return (
            <div key={idx} className="relative">
              <div className={`absolute left-[-35px] top-0 h-7 w-7 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm text-zinc-650 dark:text-zinc-350`}>
                <ItemIcon className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">{item.time}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Reusable status badge
const PremiumBadge: React.FC<{ status: string }> = ({ status }) => {
  const dotColors: { [key: string]: string } = {
    Available: 'bg-emerald-500 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
    Reserved: 'bg-amber-500 border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
    Collected: 'bg-sky-500 border-sky-500/20 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20',
    Cancelled: 'bg-rose-500 border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20',
    Expired: 'bg-zinc-500 border-zinc-500/20 text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20',
  };

  const colors = dotColors[status] || 'bg-zinc-500 border-zinc-500/20 text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20';
  const dotColor = status === 'Available' ? 'bg-emerald-500' : status === 'Reserved' ? 'bg-amber-500' : status === 'Collected' ? 'bg-sky-500' : status === 'Cancelled' ? 'bg-rose-500' : 'bg-zinc-500';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide shadow-sm ${colors}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
      {status}
    </span>
  );
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  
  // App states
  const [foods, setFoods] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoadingIds, setActionLoadingIds] = useState<string[]>([]);
  
  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [vegNonVeg, setVegNonVeg] = useState('Veg');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('servings');
  const [pickupStart, setPickupStart] = useState('12:00');
  const [pickupEnd, setPickupEnd] = useState('15:00');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('18:00');
  const [pickupLocation, setPickupLocation] = useState('');
  const [imageOption, setImageOption] = useState('select'); // 'select' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [selectedStockImg, setSelectedStockImg] = useState('Cooked Meals');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Stock categories default images
  const stockImages: { [key: string]: string } = {
    'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    'Baked Goods': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    'Raw Ingredients': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    'Groceries': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&auto=format&fit=crop&q=60',
    'Others': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60',
  };

  // Student states
  const [availableFoods, setAvailableFoods] = useState<any[]>([]);
  const [reservedFoods, setReservedFoods] = useState<any[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingReserved, setLoadingReserved] = useState(true);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<any | null>(null);
  const [cancelledHistory, setCancelledHistory] = useState<any[]>([]);

  // Student Filter/Sort States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCategory, setStudentCategory] = useState('All');
  const [studentVegFilter, setStudentVegFilter] = useState('All');
  const [studentSortBy, setStudentSortBy] = useState('newest');

  // Admin states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState('All');
  const [adminConfirmDeleteUserId, setAdminConfirmDeleteUserId] = useState<string | null>(null);
  
  // Analytics states (All listings in system)
  const [systemListings, setSystemListings] = useState<any[]>([]);
  const [loadingSystemListings, setLoadingSystemListings] = useState(true);

  const categories = ['Cooked Meals', 'Baked Goods', 'Raw Ingredients', 'Groceries', 'Others'];

  // Load user logged foods (Kitchen Staff)
  const loadFoods = async () => {
    if (!user) return;
    try {
      setLoadingListings(true);
      const data = await getFoodsApi({ createdBy: user._id });
      if (data.success && data.foods) {
        setFoods(data.foods);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to fetch food listings');
    } finally {
      setLoadingListings(false);
    }
  };

  // Load available food listings (Student)
  const loadAvailableFoods = async () => {
    try {
      setLoadingAvailable(true);
      const data = await getFoodsApi({ status: 'Available' });
      if (data.success && data.foods) {
        setAvailableFoods(data.foods);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to load available food surplus');
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Load student reservations (Student)
  const loadReservedFoods = async () => {
    if (!user) return;
    try {
      setLoadingReserved(true);
      const data = await getFoodsApi({ reservedBy: user._id });
      if (data.success && data.foods) {
        setReservedFoods(data.foods);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to load reservations history');
    } finally {
      setLoadingReserved(false);
    }
  };

  const loadUsersList = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsersApi();
      if (data.success && data.users) {
        setUsersList(data.users);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to fetch registered users list');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSystemListings = async () => {
    try {
      setLoadingSystemListings(true);
      const data = await getFoodsApi({});
      if (data.success && data.foods) {
        setSystemListings(data.foods);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to fetch system food listings');
    } finally {
      setLoadingSystemListings(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'Student') {
      loadAvailableFoods();
      loadReservedFoods();
      
      const localCancelled = localStorage.getItem('cancelled_reservations');
      if (localCancelled) {
        try {
          setCancelledHistory(JSON.parse(localCancelled));
        } catch (e) {
          console.error(e);
        }
      }
    } else if (user.role === 'Admin') {
      loadUsersList();
      loadSystemListings();
    } else {
      loadFoods();
    }
  }, [user]);

  // Admin handlers
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const data = await updateUserRoleApi(userId, newRole);
      if (data.success) {
        toast('success', 'User role updated successfully!');
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const data = await deleteUserApi(userId);
      if (data.success) {
        toast('success', 'User account deleted successfully');
        setUsersList(prev => prev.filter(u => u._id !== userId));
        setAdminConfirmDeleteUserId(null);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to delete user');
    }
  };

  const handleAdminDeleteListing = async (foodId: string) => {
    try {
      const data = await deleteFoodApi(foodId);
      if (data.success) {
        toast('success', 'Listing deleted successfully by administrator');
        setSystemListings(prev => prev.filter(item => item._id !== foodId));
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to delete listing');
    }
  };

  const getFilteredUsers = () => {
    return usersList.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(adminUserSearch.toLowerCase()) || 
                            u.email.toLowerCase().includes(adminUserSearch.toLowerCase());
      const matchesRole = adminUserRoleFilter === 'All' || u.role === adminUserRoleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const getFilteredSystemListings = () => {
    return systemListings
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'quantity-desc') return b.quantity - a.quantity;
        return 0;
      });
  };

  // Student specific handlers
  const handleReserveFood = async (foodId: string) => {
    setActionLoadingIds(prev => [...prev, foodId]);
    try {
      const data = await reserveFoodApi(foodId);
      if (data.success && data.food) {
        toast('success', 'Food listing reserved successfully! Check details for pickup instructions.');
        // Remove from available local state immediately
        setAvailableFoods(prev => prev.filter(item => item._id !== foodId));
        // Add to reserved list immediately
        setReservedFoods(prev => [data.food, ...prev]);
        // Close modal
        setSelectedFoodDetails(null);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to reserve food item');
    } finally {
      setActionLoadingIds(prev => prev.filter(id => id !== foodId));
    }
  };

  const handleCancelReservation = async (food: any) => {
    setActionLoadingIds(prev => [...prev, food._id]);
    try {
      const data = await cancelReservationApi(food._id);
      if (data.success) {
        toast('success', 'Reservation cancelled successfully. Food is returned to listings.');
        // Remove from reserved list
        setReservedFoods(prev => prev.filter(item => item._id !== food._id));
        // Add to cancelled logs history
        const cancelledRecord = {
          ...food,
          status: 'Cancelled',
          cancelledAt: new Date().toISOString()
        };
        const updatedCancelled = [cancelledRecord, ...cancelledHistory];
        setCancelledHistory(updatedCancelled);
        localStorage.setItem('cancelled_reservations', JSON.stringify(updatedCancelled));
        // Reload available items
        loadAvailableFoods();
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to cancel reservation');
    } finally {
      setActionLoadingIds(prev => prev.filter(id => id !== food._id));
    }
  };

  const handleCollectFood = async (food: any) => {
    setActionLoadingIds(prev => [...prev, food._id]);
    try {
      const data = await collectFoodApi(food._id);
      if (data.success) {
        toast('success', 'Thank you! Surplus food marked as collected.');
        // Update local list
        setReservedFoods(prev => prev.map(item => item._id === food._id ? { ...item, status: 'Collected' } : item));
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to mark collection');
    } finally {
      setActionLoadingIds(prev => prev.filter(id => id !== food._id));
    }
  };

  const getFilteredAvailableFoods = () => {
    return availableFoods
      .filter(food => {
        const matchesSearch = food.title.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesCategory = studentCategory === 'All' || food.category === studentCategory;
        
        const vegTag = getVegBadge(food.description);
        const matchesVeg = studentVegFilter === 'All' || vegTag === studentVegFilter;
        
        return matchesSearch && matchesCategory && matchesVeg;
      })
      .sort((a, b) => {
        if (studentSortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (studentSortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        if (studentSortBy === 'pickup') {
          const aHours = getPickupHours(a.description) || '00:00';
          const bHours = getPickupHours(b.description) || '00:00';
          const aStart = aHours.split('-')[0].trim();
          const bStart = bHours.split('-')[0].trim();
          return aStart.localeCompare(bStart);
        }
        return 0;
      });
  };

  // Handle Form resets
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Cooked Meals');
    setVegNonVeg('Veg');
    setQuantity(1);
    setUnit('servings');
    setPickupStart('12:00');
    setPickupEnd('15:00');
    
    // Set tomorrow as default expiry date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpiryDate(tomorrow.toISOString().split('T')[0]);
    setExpiryTime('18:00');
    
    setPickupLocation('');
    setImageOption('select');
    setImageUrl('');
    setSelectedStockImg('Cooked Meals');
    setEditingFood(null);
  };

  // Switch to Add view
  const handleAddView = () => {
    resetForm();
    setActiveTab('add-food');
  };

  // Switch to Edit view
  const handleEditView = (food: any) => {
    setEditingFood(food);
    
    // Parse description for Veg and Pickups metadata
    // Format was saved as: [Veg] [Pickup: 12:00 - 15:00] actual_description
    let parsedDesc = food.description;
    let parsedVeg = 'Veg';
    let parsedStart = '12:00';
    let parsedEnd = '15:00';

    if (parsedDesc.startsWith('[Veg]')) {
      parsedVeg = 'Veg';
      parsedDesc = parsedDesc.replace('[Veg]', '').trim();
    } else if (parsedDesc.startsWith('[Non-Veg]')) {
      parsedVeg = 'Non-Veg';
      parsedDesc = parsedDesc.replace('[Non-Veg]', '').trim();
    }

    const pickupRegex = /\[Pickup:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\]/;
    const match = parsedDesc.match(pickupRegex);
    if (match) {
      parsedStart = match[1];
      parsedEnd = match[2];
      parsedDesc = parsedDesc.replace(pickupRegex, '').trim();
    }

    setTitle(food.title);
    setDescription(parsedDesc);
    setCategory(food.category);
    setVegNonVeg(parsedVeg);
    setQuantity(food.quantity);
    setUnit(food.unit);
    setPickupStart(parsedStart);
    setPickupEnd(parsedEnd);
    
    const expDate = new Date(food.expiryTime);
    setExpiryDate(expDate.toISOString().split('T')[0]);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    setExpiryTime(`${pad(expDate.getHours())}:${pad(expDate.getMinutes())}`);
    
    setPickupLocation(food.pickupLocation);
    
    // Check if image matches stock
    const isStock = Object.values(stockImages).includes(food.image || '');
    if (isStock) {
      setImageOption('select');
      const categoryMatch = Object.keys(stockImages).find(key => stockImages[key] === food.image) || 'Cooked Meals';
      setSelectedStockImg(categoryMatch);
    } else {
      setImageOption('url');
      setImageUrl(food.image || '');
    }

    setActiveTab('edit-food');
  };

  // Form submit handler (Add / Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !description || !pickupLocation || !expiryDate || !expiryTime) {
      toast('error', 'Please fill in all the required form fields.');
      return;
    }

    setFormSubmitting(true);
    try {
      // 1. Structure description to carry metadata
      const formattedDescription = `[${vegNonVeg}] [Pickup: ${pickupStart} - ${pickupEnd}] ${description}`;

      // 2. Resolve image
      const finalImage = imageOption === 'select' ? stockImages[selectedStockImg] : (imageUrl || stockImages[category]);

      // 3. Set expiry timestamp
      const finalExpiryTime = new Date(`${expiryDate}T${expiryTime}:00`).toISOString();

      // 4. Mock location coordinates to satisfy validator
      const mockLatitude = 37.7749 + (Math.random() - 0.5) * 0.01;
      const mockLongitude = -122.4194 + (Math.random() - 0.5) * 0.01;

      const payload = {
        title,
        description: formattedDescription,
        category,
        quantity,
        unit,
        expiryTime: finalExpiryTime,
        pickupLocation,
        latitude: mockLatitude,
        longitude: mockLongitude,
        image: finalImage,
      };

      let res;
      if (editingFood) {
        // Edit flow
        res = await updateFoodApi(editingFood._id, payload);
        if (res.success) {
          toast('success', 'Food listing updated successfully', 'Listing Updated');
        }
      } else {
        // Create flow
        res = await createFoodApi(payload);
        if (res.success) {
          toast('success', 'New food listing created successfully', 'Listing Created');
        }
      }

      // Reload listings and return to dashboard
      await loadFoods();
      setActiveTab('listings');
      resetForm();
    } catch (err: any) {
      toast('error', err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await deleteFoodApi(deleteConfirmId);
      if (res.success) {
        toast('success', 'Food listing deleted successfully', 'Listing Removed');
        setFoods(prev => prev.filter(item => item._id !== deleteConfirmId));
      }
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete listing');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Quick stats extraction
  const totalListings = foods.length;
  const activeListings = foods.filter(item => item.status === 'Available').length;
  const reservedListings = foods.filter(item => item.status === 'Reserved').length;
  const completedDonations = foods.filter(item => item.status === 'Collected').length;

  // Search/Filter/Sort logic
  const getFilteredFoods = () => {
    return foods
      .filter(item => {
        // Search filter
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        // Category filter
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Sort logic
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'quantity-desc') {
          return b.quantity - a.quantity;
        } else if (sortBy === 'expiry-soon') {
          return new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime();
        }
        return 0;
      });
  };

  const filteredFoods = getFilteredFoods();

  // Helper to parse description for card displays
  const getCleanDescription = (descText: string) => {
    let clean = descText;
    if (clean.startsWith('[Veg]')) {
      clean = clean.replace('[Veg]', '').trim();
    } else if (clean.startsWith('[Non-Veg]')) {
      clean = clean.replace('[Non-Veg]', '').trim();
    }
    const match = clean.match(/\[Pickup:.*?\]/);
    if (match) {
      clean = clean.replace(match[0], '').trim();
    }
    return clean;
  };

  // Helper to retrieve veg badge
  const getVegBadge = (descText: string) => {
    if (descText.startsWith('[Veg]')) return 'Veg';
    if (descText.startsWith('[Non-Veg]')) return 'Non-Veg';
    return null;
  };

  // Helper to retrieve pickup hours
  const getPickupHours = (descText: string) => {
    const match = descText.match(/\[Pickup:\s*(.*?)\s*\]/);
    return match ? match[1] : null;
  };

  // Unified Premium Dashboard Layout Wrapper (Notion/Linear inspired side-nav)
  const DashboardLayout: React.FC<{
    user: any;
    activeTab: TabView;
    setActiveTab: (tab: TabView) => void;
    tabs: Array<{ id: string; label: string; icon: any }>;
    children: React.ReactNode;
    onLogout: () => void;
    extraHeaderAction?: React.ReactNode;
  }> = ({ user, activeTab, setActiveTab, tabs, children, onLogout, extraHeaderAction }) => {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-zinc-50/40 dark:bg-zinc-950/40 transition-colors duration-300 relative">
        
        {/* Desktop Side Navigation */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-16 md:left-0 md:bg-white dark:md:bg-zinc-900 border-r border-zinc-200/50 dark:border-zinc-800/50 z-20 justify-between py-6 px-4">
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-150 dark:border-zinc-800/50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{user?.name}</h4>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Lists */}
            <nav className="space-y-1 relative">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id || (tab.id === 'listings' && (activeTab === 'add-food' || activeTab === 'edit-food'));
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabView)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                        : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <TabIcon className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            {extraHeaderAction && <div className="px-1">{extraHeaderAction}</div>}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header Tabs Navigation */}
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-16 z-30 py-2.5 px-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{user?.name}</span>
            </div>
            {extraHeaderAction}
          </div>
          <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'listings' && (activeTab === 'add-food' || activeTab === 'edit-food'));
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Pane */}
        <main className="flex-1 md:pl-64 flex flex-col min-w-0">
          <div className="flex-grow flex flex-col">
            {children}
          </div>
        </main>

      </div>
    );
  };

  // Reusable Interactive Algorithms in Action DSA Visualizer Panel
  const AlgorithmsInAction: React.FC<{ defaultAlgo: string }> = ({ defaultAlgo }) => {
    const [selectedAlgo, setSelectedAlgo] = useState<string>(defaultAlgo);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [step, setStep] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(1800); // speed in ms

    const ALGO_DETAILS: {
      [key: string]: {
        name: string;
        timeComp: string;
        spaceComp: string;
        reason: string;
        explanation: string;
        steps: string[];
      };
    } = {
      min_heap: {
        name: "Min Heap (Food Inventory Expiry)",
        timeComp: "O(1) Peek, O(log N) Insert/Extract",
        spaceComp: "O(N) Storage",
        reason: "Priority queues are required to track surplus foods closest to their expiry time. A Min Heap provides O(1) retrieval of the most urgent item.",
        explanation: "Each node represents a food listing. When a new item is logged, it bubbles up based on expiry time. The item at the root is always the next to expire.",
        steps: [
          "Initial State: Expiry heap is loaded with items. Root is 12 hours left.",
          "Inserting new food item with urgent expiry (3 hours). Placed at the end of the array [12, 18, 24, 30, 45, 3].",
          "Heapify Up (Bubble up): Compare 3 with parent (24). Since 3 < 24, swap them: [12, 18, 3, 30, 45, 24].",
          "Heapify Up (Bubble up): Compare 3 with parent (12). Since 3 < 12, swap them: [3, 18, 12, 30, 45, 24]. Root is now 3 hours left.",
          "Extract Min (Claim food): Root item (3) is claimed. Replace root with last element (24): [24, 18, 12, 30, 45].",
          "Heapify Down (Sink down): Compare 24 with children (18 and 12). Swap with smaller child (12): [12, 18, 24, 30, 45]. Heap property restored!"
        ]
      },
      hash_map: {
        name: "Hash Map (Category Distribution)",
        timeComp: "O(1) Average Search/Insert",
        spaceComp: "O(N) Space",
        reason: "Surplus categories must be aggregated instantly. Hash Maps enable constant-time lookups and category frequency counts.",
        explanation: "Food categories are hashed using a hash function to find the bucket index. If multiple keys hash to the same bucket, we chain them using linked lists.",
        steps: [
          "Initial Map: Bucket slots 0-7 are initialized as empty lists.",
          "Hashing 'Baked Goods': h('Baked Goods') = sum(chars) % 8 = index 3.",
          "Inserting 'Baked Goods' at bucket index 3.",
          "Hashing 'Cooked Meals': h('Cooked Meals') = index 3. Collision detected at index 3!",
          "Resolving Collision (Chaining): Append 'Cooked Meals' to the linked list at bucket index 3."
        ]
      },
      dijkstra: {
        name: "Dijkstra (Shortest Redistribution Path)",
        timeComp: "O((V + E) log V)",
        spaceComp: "O(V + E)",
        reason: "Redistributing hot surplus meals requires minimizing travel time. Dijkstra computes the absolute shortest transit path.",
        explanation: "Nodes represent kitchens, hubs, and NGOs. We recursively select the unvisited node with the smallest tentative distance and relax all its outgoing edges.",
        steps: [
          "Initialize: Set distance to source Kitchen (A) = 0, and all other nodes to Infinity.",
          "Visit Node A: Calculate tentative distances to neighbors: Hub B = 4, Hub C = 2.",
          "Select C (Min distance unvisited): Inspect C's neighbors. Distance to Hub D becomes 2 + 3 = 5.",
          "Select B (Min distance unvisited): Inspect B's neighbors. Distance to D remains 5 (since 4 + 2 = 6 > 5). Distance to NGO E becomes 4 + 7 = 11.",
          "Select D (Min distance unvisited): Inspect D's neighbors. Distance to NGO E becomes 5 + 2 = 7 (shorter than 11!).",
          "Shortest Path Found: Optimal path is Kitchen A -> Hub C -> Hub D -> NGO E (total weight = 7)."
        ]
      },
      greedy: {
        name: "Greedy Algorithm (NGO Batch Match)",
        timeComp: "O(N log N) due to sorting",
        spaceComp: "O(1) auxiliary",
        reason: "NGOs claim multiple donations under vehicle capacity constraints. A Greedy choice maximizes food volume rescued per trip.",
        explanation: "Items are sorted by their quantity-to-distance ratio. The algorithm greedily takes the best items first until the truck is full.",
        steps: [
          "Sort available bulk batches by Priority Ratio (Volume / Distance).",
          "Batch 1 Ratio = 12.0 (Highest). Select this batch completely (40% truck capacity filled).",
          "Batch 2 Ratio = 8.5. Select this batch completely (75% truck capacity filled).",
          "Batch 3 Ratio = 5.0. Truck capacity remaining = 25%. Greedily claim a fractional amount of this batch.",
          "Complete Match: NGO transport load is optimized to maximize community nourishment."
        ]
      },
      merge_sort: {
        name: "Merge Sort (Waste Analytics Timeline)",
        timeComp: "O(N log N) guaranteed",
        spaceComp: "O(N) temp storage",
        reason: "Historical reports must be sorted chronologically. Merge Sort offers guaranteed O(N log N) sorting stability for large time-series logs.",
        explanation: "Divide the unsorted log array into two halves, recursively sort both halves, and then merge the sorted halves back together.",
        steps: [
          "Divide: Split the unsorted waste log timestamps into single elements.",
          "Merge step 1: Compare adjacent logs and merge into sorted pairs.",
          "Merge step 2: Compare pairs and merge into sorted blocks of 4.",
          "Final Merge: Combine the remaining sorted halves to form the chronological timeline."
        ]
      },
      queue: {
        name: "Queue (Claim Reservation FIFO)",
        timeComp: "O(1) push and pop",
        spaceComp: "O(N) memory",
        reason: "Surplus meals must be distributed fairly. A Queue (First-In, First-Out) ensures reservations are processed in exact order of arrival.",
        explanation: "Students and NGOs join the queue at the rear. The kitchen processes and dispatches reservations from the front of the queue.",
        steps: [
          "Queue Initial: Contains [Claim #101, Claim #102].",
          "Enqueue: Claim #103 arrives and joins at the Rear.",
          "Dispatch: Kitchen finishes preparing Claim #101. It is Dequeued from the Front.",
          "Dispatch: Kitchen prepares Claim #102. It is Dequeued from the Front."
        ]
      },
      binary_search: {
        name: "Binary Search (Food Search Engine)",
        timeComp: "O(log N)",
        spaceComp: "O(1)",
        reason: "Searching through catalog listings. Binary Search provides sub-linear scale lookups as the food database expands.",
        explanation: "Look at the middle element. If target matches, return index. If target is smaller, repeat search in left half; otherwise, search right half.",
        steps: [
          "Sorted List: [10, 15, 20, 30, 45, 60, 75, 80, 95]. Target = 75.",
          "Step 1: low = 0, high = 8. Mid = 4 (value = 45). Target 75 > 45, search right half.",
          "Step 2: low = 5, high = 8. Mid = 6 (value = 75). Target 75 === 75. Index Found!"
        ]
      },
      quick_sort: {
        name: "Quick Sort (Donations Urgency Sort)",
        timeComp: "O(N log N) Average",
        spaceComp: "O(log N) recursion depth",
        reason: "Donations are sorted dynamically by urgency levels. Quick Sort is in-place and performs extremely fast for catalog sorting.",
        explanation: "Pick a pivot element. Partition array such that elements smaller than pivot go left, and larger elements go right. Recursively sort partitions.",
        steps: [
          "Select Pivot: Element 45 is chosen as pivot.",
          "Partitioning: Move items smaller than 45 left, larger items right.",
          "Recursive Sort: Sort the left subarray [12, 30] and right subarray [60, 80] around their pivots.",
          "Completed: Entire donations array is sorted by urgency weight."
        ]
      }
    };

    const details = ALGO_DETAILS[selectedAlgo];

    useEffect(() => {
      let interval: any = null;
      if (isPlaying) {
        interval = setInterval(() => {
          setStep((prev) => {
            if (prev >= details.steps.length - 1) {
              return 0; // loop back
            }
            return prev + 1;
          });
        }, speed);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isPlaying, selectedAlgo, speed, details.steps.length]);

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleReplay = () => {
      setStep(0);
      setIsPlaying(true);
    };

    // Render the specific visual structure based on algorithm and active step
    const renderVisualRepresentation = () => {
      switch (selectedAlgo) {
        case "min_heap": {
          let heapArr: number[] = [12, 18, 24, 30, 45];
          let highlights: number[] = [];
          if (step === 1) {
            heapArr = [12, 18, 24, 30, 45, 3];
            highlights = [5];
          } else if (step === 2) {
            heapArr = [12, 18, 3, 30, 45, 24];
            highlights = [2, 5];
          } else if (step === 3) {
            heapArr = [3, 18, 12, 30, 45, 24];
            highlights = [0, 2];
          } else if (step === 4) {
            heapArr = [24, 18, 12, 30, 45];
            highlights = [0];
          } else if (step === 5) {
            heapArr = [12, 18, 24, 30, 45];
            highlights = [0, 2];
          }

          return (
            <div className="flex flex-col items-center justify-center h-48 space-y-6">
              {/* Render as a tree layer structure */}
              <div className="flex flex-col items-center gap-4 relative">
                {/* Level 0 */}
                <div className="flex justify-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    highlights.includes(0) ? 'border-amber-400 bg-amber-400/20 text-amber-500 animate-pulse' : 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {heapArr[0] || '?'}
                  </div>
                </div>
                {/* Level 1 */}
                <div className="flex gap-16">
                  {heapArr.length > 1 && (
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      highlights.includes(1) ? 'border-amber-400 bg-amber-400/20 text-amber-500 animate-pulse' : 'border-zinc-400 bg-zinc-100 dark:bg-zinc-800 text-zinc-655'
                    }`}>
                      {heapArr[1]}
                    </div>
                  )}
                  {heapArr.length > 2 && (
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      highlights.includes(2) ? 'border-amber-400 bg-amber-400/20 text-amber-500 animate-pulse' : 'border-zinc-400 bg-zinc-100 dark:bg-zinc-800 text-zinc-655'
                    }`}>
                      {heapArr[2]}
                    </div>
                  )}
                </div>
                {/* Level 2 */}
                <div className="flex gap-4">
                  {heapArr.slice(3, 7).map((val, idx) => (
                    <div key={idx} className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      highlights.includes(3 + idx) ? 'border-amber-400 bg-amber-400/20 text-amber-500 animate-pulse' : 'border-zinc-300 bg-zinc-50 dark:bg-zinc-900 text-zinc-500'
                    }`}>
                      {val}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {heapArr.map((val, idx) => (
                  <span key={idx} className={`px-2 py-1 text-xs font-mono border rounded ${highlights.includes(idx) ? 'border-amber-400 bg-amber-400/10 text-amber-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400'}`}>
                    {val}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        case "hash_map": {
          const buckets: any[] = Array.from({ length: 8 }, () => []);
          let activeIndex = -1;
          if (step >= 1) {
            buckets[3].push("Baked Goods");
            activeIndex = 3;
          }
          if (step >= 3) {
            buckets[5].push("Groceries");
            activeIndex = 5;
          }
          if (step >= 4) {
            buckets[3].push("Cooked Meals");
            activeIndex = 3;
          }

          return (
            <div className="grid grid-cols-1 gap-2 h-48 overflow-y-auto pr-2">
              {buckets.map((list, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-1.5 rounded-xl border transition-all ${
                  activeIndex === idx ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-150 dark:border-zinc-800/40'
                }`}>
                  <span className="text-[10px] font-bold text-zinc-400 font-mono w-14">Bucket {idx}:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {list.length === 0 ? (
                      <span className="text-[9px] text-zinc-400 italic font-mono">null</span>
                    ) : (
                      list.map((item: string, i: number) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-zinc-400 text-xs font-bold font-mono">→</span>}
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg whitespace-nowrap">
                            {item}
                          </span>
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        case "dijkstra": {
          // Graph coordinates: Kitchen A (left), Hub B (top), Hub C (bottom), Hub D (mid-right), NGO E (right)
          // Steps correspond to path expansions
          let nodeStates: any = { A: "unvisited", B: "unvisited", C: "unvisited", D: "unvisited", E: "unvisited" };
          let distances: any = { A: "0", B: "∞", C: "∞", D: "∞", E: "∞" };
          let shortestPath: string[] = [];

          if (step === 0) {
            nodeStates.A = "active";
          } else if (step === 1) {
            nodeStates.A = "visited";
            nodeStates.B = "active";
            nodeStates.C = "active";
            distances.B = "4";
            distances.C = "2";
          } else if (step === 2) {
            nodeStates.A = "visited";
            nodeStates.C = "visited";
            nodeStates.D = "active";
            distances.B = "4";
            distances.C = "2";
            distances.D = "5";
          } else if (step === 3) {
            nodeStates.A = "visited";
            nodeStates.C = "visited";
            nodeStates.B = "visited";
            nodeStates.D = "visited";
            nodeStates.E = "active";
            distances.B = "4";
            distances.C = "2";
            distances.D = "5";
            distances.E = "11";
          } else if (step === 4) {
            nodeStates.A = "visited";
            nodeStates.C = "visited";
            nodeStates.B = "visited";
            nodeStates.D = "visited";
            nodeStates.E = "visited";
            distances.B = "4";
            distances.C = "2";
            distances.D = "5";
            distances.E = "7";
            shortestPath = ["A", "C", "D", "E"];
          } else if (step === 5) {
            nodeStates.A = "visited";
            nodeStates.C = "visited";
            nodeStates.B = "visited";
            nodeStates.D = "visited";
            nodeStates.E = "visited";
            distances.B = "4";
            distances.C = "2";
            distances.D = "5";
            distances.E = "7";
            shortestPath = ["A", "C", "D", "E"];
          }

          const nodeCoords: any = {
            A: { x: "10%", y: "45%" },
            B: { x: "40%", y: "15%" },
            C: { x: "40%", y: "75%" },
            D: { x: "70%", y: "45%" },
            E: { x: "90%", y: "45%" }
          };

          return (
            <div className="h-48 relative border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl overflow-hidden shadow-inner">
              {/* Lines mapping */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 1 }}>
                {/* Edge paths */}
                <line x1="10%" y1="45%" x2="40%" y2="15%" stroke={shortestPath.includes("A") && shortestPath.includes("B") ? "#f59e0b" : "#d4d4d8"} strokeWidth={shortestPath.includes("A") && shortestPath.includes("B") ? "3" : "1.5"} opacity="0.6" />
                <line x1="10%" y1="45%" x2="40%" y2="75%" stroke={shortestPath.includes("A") && shortestPath.includes("C") ? "#f59e0b" : "#d4d4d8"} strokeWidth={shortestPath.includes("A") && shortestPath.includes("C") ? "3" : "1.5"} opacity="0.6" />
                <line x1="40%" y1="15%" x2="70%" y2="45%" stroke={shortestPath.includes("B") && shortestPath.includes("D") ? "#f59e0b" : "#d4d4d8"} strokeWidth={shortestPath.includes("B") && shortestPath.includes("D") ? "3" : "1.5"} opacity="0.6" />
                <line x1="40%" y1="75%" x2="70%" y2="45%" stroke={shortestPath.includes("C") && shortestPath.includes("D") ? "#f59e0b" : "#d4d4d8"} strokeWidth={shortestPath.includes("C") && shortestPath.includes("D") ? "3" : "1.5"} opacity="0.6" />
                <line x1="70%" y1="45%" x2="90%" y2="45%" stroke={shortestPath.includes("D") && shortestPath.includes("E") ? "#f59e0b" : "#d4d4d8"} strokeWidth={shortestPath.includes("D") && shortestPath.includes("E") ? "3" : "1.5"} opacity="0.6" />
              </svg>

              {Object.keys(nodeCoords).map((n) => {
                const state = nodeStates[n];
                const activeBorder = state === "active" ? "border-amber-400 bg-amber-400/20 text-amber-500 scale-110 shadow-lg shadow-amber-500/10" : state === "visited" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-zinc-350 bg-white dark:bg-zinc-900 text-zinc-500";
                return (
                  <div
                    key={n}
                    className={`absolute h-8 w-8 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${activeBorder}`}
                    style={{ left: nodeCoords[n].x, top: nodeCoords[n].y, transform: "translate(-50%, -50%)", zIndex: 10 }}
                  >
                    <span>{n}</span>
                    <span className="absolute bottom-[-16px] text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500">{distances[n]}</span>
                  </div>
                );
              })}
            </div>
          );
        }
        case "greedy": {
          let truckLoad = 0;
          let activeIndex = -1;
          if (step === 2) {
            truckLoad = 40;
            activeIndex = 0;
          } else if (step === 3) {
            truckLoad = 75;
            activeIndex = 1;
          } else if (step === 4) {
            truckLoad = 100;
            activeIndex = 2;
          }

          const items = [
            { name: "Batch A (Ratio 12.0)", weight: "40kg" },
            { name: "Batch B (Ratio 8.5)", weight: "35kg" },
            { name: "Batch C (Ratio 5.0)", weight: "25kg" }
          ];

          return (
            <div className="flex flex-col justify-center h-48 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-500">
                  <span>NGO Truck load capacity</span>
                  <span className="text-emerald-500">{truckLoad}% capacity filled</span>
                </div>
                <div className="w-full h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-300 dark:border-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[9px] font-bold text-white"
                    style={{ width: `${truckLoad}%` }}
                  >
                    {truckLoad > 0 && `${truckLoad}%`}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border flex justify-between items-center text-xs transition-all ${
                    idx === activeIndex ? 'border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400 animate-pulse' : idx < activeIndex ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600' : 'border-zinc-150 dark:border-zinc-800/40 text-zinc-400'
                  }`}>
                    <span className="font-semibold">{item.name}</span>
                    <span className="font-mono text-[10px]">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        case "merge_sort": {
          let rows: any[] = [];
          if (step === 0) {
            rows = [
              [78, 23, 45, 12, 56, 89, 34, 90]
            ];
          } else if (step === 1) {
            rows = [
              [78, 23], [45, 12], [56, 89], [34, 90]
            ];
          } else if (step === 2) {
            rows = [
              [23, 78], [12, 45], [56, 89], [34, 90]
            ];
          } else if (step === 3) {
            rows = [
              [12, 23, 45, 78], [34, 56, 89, 90]
            ];
          } else if (step === 4) {
            rows = [
              [12, 23, 34, 45, 56, 78, 89, 90]
            ];
          }

          return (
            <div className="flex flex-col justify-center items-center h-48 space-y-4">
              {rows.map((row, idx) => (
                <div key={idx} className="flex gap-4">
                  {Array.isArray(row[0]) ? (
                    row.map((sub: any, i: number) => (
                      <div key={i} className="flex gap-1 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                        {sub.map((v: number) => (
                          <span key={v} className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 shadow-sm text-zinc-700 dark:text-zinc-300">
                            {v}
                          </span>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-1 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 shadow-sm">
                      {row.map((v: number) => (
                        <span key={v} className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }
        case "queue": {
          let list = ["Claim #101", "Claim #102"];
          let highlightIdx = -1;
          if (step === 1) {
            list = ["Claim #101", "Claim #102", "Claim #103"];
            highlightIdx = 2; // enqueue rear
          } else if (step === 2) {
            list = ["Claim #102", "Claim #103"];
            highlightIdx = 0; // dequeue front
          } else if (step === 3) {
            list = ["Claim #103"];
            highlightIdx = 0;
          }

          return (
            <div className="flex flex-col justify-center items-center h-48 space-y-6">
              <div className="flex items-center gap-1.5 border-y-2 border-zinc-350 bg-zinc-50 dark:bg-zinc-950/20 py-4 px-8 w-full max-w-md justify-center relative overflow-hidden rounded-xl">
                <span className="absolute left-2 text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Front</span>
                <span className="absolute right-2 text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Rear</span>
                <AnimatePresence mode="popLayout">
                  {list.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.8 }}
                      className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-all shadow-sm ${
                        idx === highlightIdx ? 'border-amber-400 bg-amber-400/10 text-amber-500' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        }
        case "binary_search": {
          const arr = [10, 15, 20, 30, 45, 60, 75, 80, 95];
          let low = 0, high = 8, mid = -1;
          if (step === 1) {
            low = 5; high = 8; mid = 4;
          } else if (step === 2) {
            low = 5; high = 8; mid = 6;
          }

          return (
            <div className="flex flex-col justify-center items-center h-48 space-y-6">
              <div className="flex gap-2">
                {arr.map((val, idx) => {
                  const isMid = idx === mid;
                  const isMatch = step === 2 && idx === 6;
                  const inBounds = idx >= low && idx <= high;
                  return (
                    <div
                      key={idx}
                      className={`h-10 w-10 border rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all relative ${
                        isMatch ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : isMid ? 'border-amber-400 bg-amber-400/20 text-amber-600 dark:text-amber-400 scale-105' : inBounds ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300' : 'border-zinc-150 bg-zinc-50 dark:border-zinc-900/40 text-zinc-400 opacity-30'
                      }`}
                    >
                      <span>{val}</span>
                      <span className="absolute bottom-[-16px] text-[8px] text-zinc-450 dark:text-zinc-500">{idx}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 text-[10px] font-bold text-zinc-400">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-400"></span> Low: Index {low}</span>
                {mid !== -1 && <span className="inline-flex items-center gap-1 text-amber-500"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Mid: Index {mid}</span>}
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-400"></span> High: Index {high}</span>
              </div>
            </div>
          );
        }
        case "quick_sort": {
          let list = [45, 12, 80, 30, 60];
          let pivot = 45;
          let leftIdx = -1;
          let rightIdx = -1;

          if (step === 1) {
            leftIdx = 1; rightIdx = 3;
          } else if (step === 2) {
            list = [30, 12, 45, 80, 60];
          } else if (step === 3) {
            list = [12, 30, 45, 60, 80];
          }

          return (
            <div className="flex flex-col justify-center items-center h-48 space-y-6">
              <div className="flex items-end gap-3 h-24 pb-2">
                {list.map((val, idx) => {
                  const isPivot = val === pivot;
                  const isLeft = idx === leftIdx;
                  const isRight = idx === rightIdx;
                  const height = `${(val / 95) * 100}%`;
                  return (
                    <div key={val} className="flex flex-col items-center gap-1.5 w-10">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isPivot ? 'bg-indigo-500 shadow-md shadow-indigo-500/20' : isLeft || isRight ? 'bg-amber-400 shadow-md shadow-amber-500/20' : 'bg-emerald-500'
                        }`}
                        style={{ height }}
                      />
                      <span className="text-[10px] font-bold font-mono text-zinc-500">{val}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 text-[9px] font-bold text-zinc-400">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-lg bg-indigo-500"></span> Pivot ({pivot})</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-lg bg-emerald-500"></span> Partition Array</span>
              </div>
            </div>
          );
        }
        default:
          return null;
      }
    };

    return (
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm overflow-hidden mt-8 animate-fade-in">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-emerald-500" />
              Algorithms in Action
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                DSA VISUALIZER
              </span>
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-500">
              Interactive structural demonstrations of the DSA engines powering EcoShare's routing and redistribution.
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-1">
            {Object.keys(ALGO_DETAILS).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedAlgo(key);
                  setStep(0);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedAlgo === key
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {key.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Simulation Display Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-6 min-h-[300px]">
            {/* Visual graph/array representation */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full">
                {renderVisualRepresentation()}
              </div>
            </div>

            {/* Animation controls block */}
            <div className="border-t border-zinc-200/80 dark:border-zinc-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleReplay}
                  className="p-2 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </button>
                <button
                  onClick={() => {
                    setStep((prev) => (prev >= details.steps.length - 1 ? 0 : prev + 1));
                    setIsPlaying(false);
                  }}
                  className="px-3 py-1.5 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                  title="Step Forward"
                >
                  <span>Step</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Speed Controller slider */}
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <span>Speed:</span>
                <input
                  type="range"
                  min="600"
                  max="3500"
                  step="200"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="font-mono text-[10px] w-12 text-right">{(speed / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Educational descriptions panel */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-50/20 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Active DSA Model</span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{details.name}</h4>
              </div>

              {/* Complexities Badges */}
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold font-mono">
                  Time: {details.timeComp}
                </span>
                <span className="px-2.5 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 rounded-xl text-[10px] font-bold font-mono">
                  Space: {details.spaceComp}
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Justification</h5>
                  <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">{details.reason}</p>
                </div>
                <div className="space-y-1 pt-2">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Redistribution Engine Impact</h5>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">{details.explanation}</p>
                </div>
              </div>
            </div>

            {/* Current Step Description Box */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1 shadow-inner">
              <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-widest">Simulation Step {step + 1} of {details.steps.length}</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-350 font-semibold leading-relaxed">
                {details.steps[step]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Interactive Live Command Center telemetry dashboard
  const LiveCommandCenter: React.FC = () => {
    const [carbonSaved, setCarbonSaved] = useState<number>(142.5);
    const [mealsRescued, setMealsRescued] = useState<number>(284);
    const [peopleFed, setPeopleFed] = useState<number>(128);
    const [co2Offset, setCo2Offset] = useState<number>(98.2);
    const [volunteers, setVolunteers] = useState<number>(32);
    const [deliveries, setDeliveries] = useState<number>(3);
    const [deliveryStep, setDeliveryStep] = useState<number>(1);
    const [systemLoad, setSystemLoad] = useState<number[]>([24, 28, 22, 35, 29, 31]);

    const [activities, setActivities] = useState<any[]>([
      { id: '1', type: 'rescue', message: 'Feeding Hearts NGO claimed 30 kg of surplus Pasta from Gordon Kitchen.', time: 'Just now', badge: 'Rescue', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
      { id: '2', type: 'donation', message: 'Gordon Dining Hall logged 15 lbs of Artisan Pastries.', time: '2m ago', badge: 'Donation', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
      { id: '3', type: 'registration', message: 'Volunteers team welcomed Sarah M. in South Sector.', time: '5m ago', badge: 'Sign Up', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
      { id: '4', type: 'system', message: 'Automated Dijkstra redistribution optimization cycle completed.', time: '12m ago', badge: 'System', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    ]);

    useEffect(() => {
      const interval = setInterval(() => {
        // Ticking metrics
        setCarbonSaved(prev => parseFloat((prev + 0.4).toFixed(1)));
        setMealsRescued(prev => prev + 1);
        setPeopleFed(prev => prev + (Math.random() > 0.6 ? 2 : 1));
        setCo2Offset(prev => parseFloat((prev + 0.3).toFixed(1)));
        setVolunteers(prev => Math.max(25, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
        setDeliveries(prev => Math.max(1, Math.min(8, prev + (Math.random() > 0.7 ? 1 : Math.random() > 0.7 ? -1 : 0))));
        setSystemLoad(prev => [...prev.slice(1), Math.floor(Math.random() * 20) + 15]);

        // Stepper increment
        setDeliveryStep(prev => (prev >= 4 ? 1 : prev + 1));

        // Push new live activity feed event
        const sources = [
          { type: 'donation', msg: 'University Cafe logged 8 kg of vegetarian wraps.', badge: 'Donation', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
          { type: 'rescue', msg: 'Student claim reservation processed for Gordon Kitchen box #202.', badge: 'Rescue', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
          { type: 'rescue', msg: 'Volunteer Dave K. marked delivery to Haven Shelter as complete.', badge: 'Transit', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
          { type: 'registration', msg: "New partner NGO 'Food For Families' registered and verified.", badge: 'NGO Sign', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
          { type: 'system', msg: 'Zero-waste metric audit calculated: 450 kg CO2 offset milestone reached.', badge: 'System', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        ];

        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const newEvent = {
          id: Date.now().toString(),
          type: randomSource.type,
          message: randomSource.msg,
          time: 'Just now',
          badge: randomSource.badge,
          color: randomSource.color
        };

        setActivities(prev => [
          newEvent,
          ...prev.map(act => act.time === 'Just now' ? { ...act, time: '1m ago' } : act).slice(0, 5)
        ]);

      }, 4000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Command Center Title Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              All Networks Active
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              EcoShare Live Command Center
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time telemetry, routing audits, and zero-waste matching optimizations.
            </p>
          </div>
          <div className="text-right z-10 font-mono text-[10px] text-zinc-500 font-bold hidden sm:block">
            <span>PING SECURE: 24ms</span>
            <span className="block mt-0.5">ESTABLISHED: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Real-time KPI Dials */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Carbon Saved Today', value: `${carbonSaved} kg`, desc: '+0.4 kg/tick', change: 'up' },
            { label: 'Meals Rescued Today', value: mealsRescued, desc: 'Enterprise volume', change: 'up' },
            { label: 'People Fed Today', value: peopleFed, desc: 'Local shelters matched', change: 'up' },
            { label: 'Food Wasted Today', value: '1.2 kg', desc: '99.4% redirect rate', change: 'stable' },
            { label: 'CO2 Reduced Today', value: `${co2Offset} kg`, desc: 'Offset benchmark', change: 'up' },
            { label: 'Active Partner NGOs', value: '18 Verified', desc: 'Real-time coordinate hooks', change: 'stable' },
            { label: 'Volunteers Online', value: volunteers, desc: 'Dijkstra route ready', change: 'up' },
            { label: 'Deliveries In Progress', value: deliveries, desc: 'Active dispatch loops', change: 'stable' }
          ].map((kpi, idx) => (
            <div key={idx} className="glass-panel apple-shadow interactive-card rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{kpi.label}</span>
                <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1.5 tracking-tight">
                  {kpi.value}
                </h4>
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
                <span>{kpi.desc}</span>
                {kpi.change === 'up' && (
                  <span className="text-emerald-500 font-bold">▲ Live</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live Double Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Feed & Tracker */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Activity Feed */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                Live Network Activity Feed
              </h3>
              <div className="space-y-4 min-h-[280px]">
                <AnimatePresence mode="popLayout">
                  {activities.map((act) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: -15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="border border-zinc-150 dark:border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-zinc-250 dark:hover:border-zinc-700 transition-all bg-zinc-50/20 dark:bg-zinc-950/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${act.color}`}>
                          {act.badge}
                        </span>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {act.message}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400 shrink-0 font-mono">{act.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Delivery Stepper Tracker */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                <Compass className="h-4.5 w-4.5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                Active Route optimization: Dijkstra Loop #409
              </h3>
              <div className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-6">
                  <span>SENDER: Gordon Kitchen</span>
                  <span className="text-emerald-500 font-mono">DISPATCH: In Transit (Route C)</span>
                  <span>DESTINATION: Hope NGO</span>
                </div>
                {/* Stepper row */}
                <div className="relative flex justify-between items-center w-full">
                  {/* Background progress bar line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-250 dark:bg-zinc-800 transform -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform -translate-y-1/2 z-0 transition-all duration-700"
                    style={{ width: `${((deliveryStep - 1) / 3) * 100}%` }}
                  />

                  {[
                    { label: 'Food Logged', desc: 'Gordon Kitchen' },
                    { label: 'Claim Verified', desc: 'NGO matched' },
                    { label: 'In Transit', desc: 'Volunteer assigned' },
                    { label: 'Delivered', desc: 'Meals handed over' }
                  ].map((stepInfo, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum === deliveryStep;
                    const isCompleted = stepNum < deliveryStep;
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : isActive
                            ? 'bg-amber-400 border-amber-400 text-zinc-900 animate-pulse scale-110 shadow-lg shadow-amber-500/10'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-400'
                        }`}>
                          {isCompleted ? '✓' : stepNum}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 ${isActive ? 'text-amber-500 font-black' : isCompleted ? 'text-emerald-600' : 'text-zinc-450 dark:text-zinc-500'}`}>
                          {stepInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* System diagnostics sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Health Diagnostics Panel */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                <Server className="h-4.5 w-4.5 text-emerald-500" />
                Network Diagnostics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Database Health', value: '100% Operational', icon: Wifi, color: 'text-emerald-500' },
                  { label: 'Redistribution API', value: '200 OK (Healthy)', icon: Cpu, color: 'text-emerald-500' },
                  { label: 'Min-Heap Priority Queue', value: 'Balanced', icon: Server, color: 'text-indigo-500' },
                  { label: 'Global Server Latency', value: '24ms', icon: Activity, color: 'text-emerald-500' }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 ${item.color}`}>
                          <ItemIcon className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500">{item.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-350">{item.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic load graph */}
              <div className="mt-6 pt-4 border-t border-zinc-150 dark:border-zinc-800/80 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Server Node CPU load</span>
                  <span className="font-mono text-emerald-500">{systemLoad[systemLoad.length - 1]}% Load</span>
                </div>
                <div className="flex items-end gap-1.5 h-16 pt-2 justify-between">
                  {systemLoad.map((load, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-emerald-500/20 dark:bg-emerald-500/10 border-t border-emerald-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${load}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Micro-learning carbon block */}
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/15 rounded-3xl space-y-3">
              <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest">Global Impact Audit</span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">Why Carbon Equivalency Matters</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Decomposing food waste accounts for 8% of global greenhouse emissions. Redirecting surplus meals directly offsets methane emissions from anaerobic landfill decomposition.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Redistribution Map View using Leaflet
  const RedistributionMap: React.FC = () => {
    const { theme } = useTheme();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const volunteerMarkerRef = useRef<L.Marker | null>(null);
    const [coordIndex, setCoordIndex] = useState<number>(0);
    const [eta, setEta] = useState<number>(8); // minutes remaining

    const routeCoordinates = [
      [43.0715, -89.3980],
      [43.0715, -89.3950],
      [43.0740, -89.3950],
      [43.0740, -89.3910],
      [43.0760, -89.3900]
    ];

    const locations = [
      { name: 'Gordon Kitchen', type: 'Restaurant', coords: [43.0715, -89.3980], icon: '🍳', color: 'bg-indigo-500 text-white' },
      { name: 'Central Campus Hub', type: 'College', coords: [43.0750, -89.4020], icon: '🎓', color: 'bg-emerald-500 text-white' },
      { name: 'South Dorms', type: 'College', coords: [43.0690, -89.4050], icon: '🎓', color: 'bg-emerald-500 text-white' },
      { name: 'Feeding Hearts Shelter', type: 'NGO', coords: [43.0760, -89.3900], icon: '❤️', color: 'bg-rose-500 text-white animate-pulse' },
      { name: 'Hope Food Foundation', type: 'NGO', coords: [43.0820, -89.4100], icon: '❤️', color: 'bg-rose-500 text-white' },
      { name: 'Second Harvest Bank', type: 'Food Bank', coords: [43.0650, -89.3920], icon: '🏦', color: 'bg-amber-500 text-white' }
    ];

    // Tick the moving volunteer marker position
    useEffect(() => {
      const interval = setInterval(() => {
        setCoordIndex((prev) => {
          const next = prev >= routeCoordinates.length - 1 ? 0 : prev + 1;
          // decrease ETA as route progresses
          setEta(Math.max(1, 8 - Math.round((next / (routeCoordinates.length - 1)) * 7)));
          return next;
        });
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    // Instantiate Map
    useEffect(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([43.0731, -89.4012], 14);
      mapInstanceRef.current = map;

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Setup custom marker icons
      const createHtmlIcon = (colorClass: string, iconHtml: string) => {
        return L.divIcon({
          className: 'custom-map-icon',
          html: `<div class="p-2 rounded-full border-2 border-white dark:border-zinc-950 shadow-md flex items-center justify-center ${colorClass}" style="width: 34px; height: 34px; font-size: 14px;">${iconHtml}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
      };

      // Add static landmarks
      locations.forEach((loc) => {
        L.marker(loc.coords as L.LatLngExpression, {
          icon: createHtmlIcon(loc.color, loc.icon)
        })
        .bindPopup(`<strong>${loc.name}</strong><br/>Type: ${loc.type}`)
        .addTo(map);
      });

      // Add shortest route path line
      L.polyline(routeCoordinates as L.LatLngExpression[], {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 8'
      }).addTo(map);

      // Add volunteer bike marker
      const startCoord = routeCoordinates[0];
      const bikeIcon = L.divIcon({
        className: 'custom-bike-icon',
        html: `<div class="p-2 rounded-full border-2 border-white dark:border-zinc-950 bg-sky-500 text-white shadow-xl flex items-center justify-center scale-110 animate-bounce" style="width: 36px; height: 36px; font-size: 16px;">🚲</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const volunteerMarker = L.marker(startCoord as L.LatLngExpression, { icon: bikeIcon })
        .bindPopup("<strong>Volunteer Dispatch</strong><br/>Rider: Alice S.<br/>Transit: MERN box #202")
        .addTo(map);
      volunteerMarkerRef.current = volunteerMarker;

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Theme tile layer updates
    useEffect(() => {
      if (!mapInstanceRef.current) return;
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }

      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; CartoDB'
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = tileLayer;
    }, [theme]);

    // Update volunteer position on coordinate tick
    useEffect(() => {
      if (!volunteerMarkerRef.current) return;
      const currentCoord = routeCoordinates[coordIndex];
      volunteerMarkerRef.current.setLatLng(currentCoord as L.LatLngExpression);
    }, [coordIndex]);

    return (
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Map Viewer */}
          <div className="lg:col-span-8 h-[450px] relative z-10" ref={mapContainerRef} />

          {/* Uber Eats Side Panel */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-250 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/10">
            <div className="space-y-6">
              <div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Live Dispatch Route
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">Dijkstra Shortest Path</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5">Eco-friendly transit routing calculations in real-time.</p>
              </div>

              {/* Order Info */}
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {eta}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">ESTIMATED ARRIVAL</span>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{eta} minutes remaining</h4>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Total Distance</span>
                    <span className="text-zinc-800 dark:text-zinc-200">1.8 miles</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Avg Transit Time</span>
                    <span className="text-zinc-800 dark:text-zinc-200">8 minutes</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Assigned Dispatch</span>
                    <span className="text-sky-500 font-bold">Alice S. (Rider)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Timeline info */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Active Dispatch Log</span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold">
                Rider currently navigating intersection of University Avenue. Dijkstra route optimization successfully refreshed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // DSA Learning Center Component
  const DsaLearningCenter: React.FC = () => {
    const [selectedAlgo, setSelectedAlgo] = useState<string>('hash_map');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [animStep, setAnimStep] = useState<number>(0);
    const [animSpeed, setAnimSpeed] = useState<number>(1000);
    
    // Learning progress state
    const [progress, setProgress] = useState<Record<string, 'Not Started' | 'In Progress' | 'Mastered'>>({
      hash_map: 'Mastered',
      queue: 'In Progress',
      priority_queue: 'Not Started',
      heap: 'Not Started',
      graph: 'In Progress',
      dijkstra: 'Not Started',
      greedy: 'Not Started',
      merge_sort: 'Not Started',
      binary_search: 'Mastered',
      quick_sort: 'Not Started',
    });

    const algos = [
      { id: 'hash_map', name: 'Hash Map', icon: '🔑', desc: 'Direct lookup map for kitchen workloads' },
      { id: 'queue', name: 'Queue', icon: '⏳', desc: 'FIFO queue for reservation booking orders' },
      { id: 'priority_queue', name: 'Priority Queue', icon: '⚡', desc: 'NGO dispatches sorted by food urgency' },
      { id: 'heap', name: 'Min-Heap', icon: '🌲', desc: 'Logarithmic priority tree for active listing sorting' },
      { id: 'graph', name: 'Graph Network', icon: '🕸️', desc: 'Relational model mapping campus map nodes' },
      { id: 'dijkstra', name: 'Dijkstra Routing', icon: '🧭', desc: 'Shortest path travel solver for food redistribution' },
      { id: 'greedy', name: 'Greedy Choice', icon: '🎯', desc: 'NGO fractional matches maximizing value-to-weight' },
      { id: 'merge_sort', name: 'Merge Sort', icon: '🥞', desc: 'Divide-and-conquer chronological timeline sort' },
      { id: 'binary_search', name: 'Binary Search', icon: '🔍', desc: 'Logarithmic search locating available dishes' },
      { id: 'quick_sort', name: 'Quick Sort', icon: '⚡', desc: 'Pivot-based array sorter organizing weight lists' }
    ];

    const algoDetails: Record<string, {
      purpose: string;
      whyUsed: string;
      timeComplexity: string;
      spaceComplexity: string;
      advantages: string[];
      disadvantages: string[];
      realLife: string;
      visualSteps: string[];
    }> = {
      hash_map: {
        purpose: 'Stores kitchen statistics mapped directly to food categories.',
        whyUsed: 'Provides constant-time O(1) reads/writes to look up active kitchen meal volumes.',
        timeComplexity: 'O(1) average, O(n) worst case',
        spaceComplexity: 'O(n) linear storage',
        advantages: ['Ultra-fast direct key lookup', 'Dynamically resizes buckets', 'Ideal for caching systems'],
        disadvantages: ['Collision handling overhead', 'Unordered keys storage', 'High memory usage density'],
        realLife: 'Database indices, DNS resolution routing tables, and server cache lookups.',
        visualSteps: ['Hashed "Veg Wrap" -> index 3', 'Hashed "Pasta" -> index 1', 'Hashed "Muffin" -> index 3 (Collision resolved via chaining!)']
      },
      queue: {
        purpose: 'Processes food claims and reservation requests in the exact order they arrive.',
        whyUsed: 'Guarantees fair FIFO (First-In, First-Out) scheduling of campus food bookings.',
        timeComplexity: 'O(1) insertion/deletion',
        spaceComplexity: 'O(n) linear storage',
        advantages: ['Guaranteed chronological ordering', 'Zero starvation risks', 'Simple enqueue/dequeue logic'],
        disadvantages: ['No random access allowed', 'Searching requires O(n) traversal', 'Fixed capacity overhead in arrays'],
        realLife: 'Print queue schedulers, request buffer logs, and customer checkout queues.',
        visualSteps: ['Claim A enqueued (Front)', 'Claim B enqueued', 'Claim C enqueued', 'Dequeue: Claim A removed first (FIFO)']
      },
      priority_queue: {
        purpose: 'Matches volunteers to active NGO dispatches prioritizing food perishability.',
        whyUsed: 'Ensures hot/highly perishable meals are picked up and delivered before shelf-life expires.',
        timeComplexity: 'O(log n) enqueue, O(1) peek',
        spaceComplexity: 'O(n) linear storage',
        advantages: ['Perishables processed first', 'Dynamically adjusting dispatches', 'Perfect for real-time triage'],
        disadvantages: ['Starvation risk for low priority items', 'Heap index pointer adjustments', 'O(n) build overhead'],
        realLife: 'Hospital emergency room scheduling, routers routing voice traffic, and OS task management.',
        visualSteps: ['Rider assigned route (Perishable index 10)', 'New route logged (Perishable index 30)', 'Sort priority: Index 30 moved to front of queue']
      },
      heap: {
        purpose: 'Maintains active campus food listing arrays sorted by weight.',
        whyUsed: 'Provides direct access to the minimum-weight donation to fit volunteer vehicle volumes.',
        timeComplexity: 'O(log n) insertion/deletion, O(n) heapify',
        spaceComplexity: 'O(n) memory footprint',
        advantages: ['Constant time minimum lookup', 'Highly space efficient in arrays', 'Excellent sorting stability'],
        disadvantages: ['No support for fast searches', 'Complex pointer/index bubbling', 'Heap index calculations'],
        realLife: 'Memory allocation systems, priority queue builders, and heapsort algorithms.',
        visualSteps: ['Insert node 40 at end', 'Parent 15 < 40 (Heap condition satisfied)', 'Insert node 5', 'Bubble up: Parent 15 > 5 -> swap!', 'Min is now 5']
      },
      graph: {
        purpose: 'Models campus intersections, restaurants, and NGO food banks.',
        whyUsed: 'Provides the node-and-edge relational framework required for Dijkstra navigation.',
        timeComplexity: 'O(V + E) traversal (BFS/DFS)',
        spaceComplexity: 'O(V + E) using adjacency list',
        advantages: ['Flexible vertex relations mapping', 'Easily models spatial maps', 'Direct pathfinding target support'],
        disadvantages: ['Adjacency matrix consumes O(V^2) space', 'Traversal loops risk cycles', 'Complex pointer graphs'],
        realLife: 'Social network friend maps, internet page links, and city transit networks.',
        visualSteps: ['College node connected to Gordon', 'Gordon node connected to NGO', 'Redistribution pathways calculated as edges']
      },
      dijkstra: {
        purpose: 'Calculates the shortest street route between food donor and NGO.',
        whyUsed: 'Minimizes transit distance, maximizing speed and reducing greenhouse gas transit footprint.',
        timeComplexity: 'O((V + E) log V) with Min-Heap',
        spaceComplexity: 'O(V) storage',
        advantages: ['Guarantees mathematical shortest path', 'Works on any non-negative graph', 'Dynamic route adjustments'],
        disadvantages: ['Cannot handle negative edge weights', 'High memory usage for large graphs', 'Iterative relaxation loops'],
        realLife: 'Google Maps directions routing, network packet routing, and robot maze pathfinding.',
        visualSteps: ['Init: dist[Gordon] = 0, dist[others] = inf', 'Relax: dist[Colleges] updated 0 + 2 = 2', 'Relax: dist[NGO] updated 2 + 3 = 5', 'Path traced']
      },
      greedy: {
        purpose: 'Selects fractions of donations to fit matching NGO requirements.',
        whyUsed: 'Maximizes total meals rescued inside matching donation batch transactions.',
        timeComplexity: 'O(n log n) sorting + O(n) selection',
        spaceComplexity: 'O(1) storage',
        advantages: ['Extremely simple implementation', 'Super fast execution speed', 'Approaches optimal solutions quickly'],
        disadvantages: ['May get stuck in local optima', 'Does not guarantee absolute global minimum', 'Requires sorting preprocessing'],
        realLife: 'Coin change matching, Huffman coding encoders, and knapsack packaging.',
        visualSteps: ['Sort items by density', 'Take 10kg of Item A (value density 5)', 'Take 5kg fraction of Item B (value density 3)', 'Capacity met!']
      },
      merge_sort: {
        purpose: 'Organizes system activity logs and donations chronologically.',
        whyUsed: 'Provides stable sorting to prevent reordering matching-time donation entries.',
        timeComplexity: 'O(n log n) in all cases',
        spaceComplexity: 'O(n) helper storage',
        advantages: ['Guaranteed worst-case O(n log n)', 'Extremely stable sort', 'Excellent for linked lists/large files'],
        disadvantages: ['Requires O(n) extra helper memory', 'Recursion stack overhead', 'Slower than quicksort on cache hits'],
        realLife: 'Sorting large files, relational database order-by clauses, and external sorting structures.',
        visualSteps: ['Split array [30, 10, 20, 50]', 'Sublists: [30, 10] and [20, 50]', 'Divide: [30], [10] | [20], [50]', 'Merge sorted: [10, 30] and [20, 50] -> [10, 20, 30, 50]']
      },
      binary_search: {
        purpose: 'Locates a specific food category or dining hall within active tables.',
        whyUsed: 'Allows students to find available meals instantly in sorted categories.',
        timeComplexity: 'O(log n) search time',
        spaceComplexity: 'O(1) storage space',
        advantages: ['Incredibly fast search speed', 'Logarithmic steps bounds search', 'Zero memory overhead'],
        disadvantages: ['Array MUST be sorted first', 'Only works on random access structures', 'Index lookup computations'],
        realLife: 'Database key searches, dictionary word lookups, and compiler symbol tables.',
        visualSteps: ['Search: 40 in [10, 20, 30, 40, 50]', 'Mid point is 30 (inf to 40) -> Search Right', 'Mid of [40, 50] is 45 -> Search Left', 'Match: 40 found!']
      },
      quick_sort: {
        purpose: 'Sorts donor kitchens by the total weight of food diverted.',
        whyUsed: 'Provides the fastest average-case array sorting to refresh active leaderboard tables.',
        timeComplexity: 'O(n log n) average, O(n^2) worst case',
        spaceComplexity: 'O(log n) recursion stack',
        advantages: ['Extremely fast in-place sorting', 'Cache-friendly pointer sweeps', 'No auxiliary helper array needed'],
        disadvantages: ['Unstable sort index shifting', 'Worst-case O(n^2) if pivot choices fail', 'High recursion depth'],
        realLife: 'Standard library sort implementations, memory cache sorting, and numeric sorting processors.',
        visualSteps: ['Array: [30, 50, 10, 20] | Pivot: 20', 'Partition smaller: [10] | Partition larger: [30, 50]', 'Concat recursively: [10] + [20] + [30, 50] -> [10, 20, 30, 50]']
      }
    };

    // Auto-ticking simulation index
    useEffect(() => {
      if (!isPlaying) return;
      const interval = setInterval(() => {
        setAnimStep((prev) => (prev >= 3 ? 0 : prev + 1));
      }, animSpeed);
      return () => clearInterval(interval);
    }, [isPlaying, animSpeed]);

    const activeDetails = algoDetails[selectedAlgo] || algoDetails.hash_map;

    // Calculate Mastered ratio
    const masteredCount = Object.values(progress).filter((v) => v === 'Mastered').length;
    const progressPercent = Math.round((masteredCount / algos.length) * 100);

    const toggleProgress = (id: string) => {
      setProgress((prev) => {
        const current = prev[id];
        const next = current === 'Not Started' ? 'In Progress' : current === 'In Progress' ? 'Mastered' : 'Not Started';
        return { ...prev, [id]: next };
      });
    };

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Learning Stats Bar */}
        <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/15 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" /> DSA Learning Center
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-400">
              Interactive sandbox detailing the 10 data structures and algorithms powering EcoShare's logistics engine.
            </p>
          </div>
          
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>Overall Progress</span>
              <span>{masteredCount} of {algos.length} Mastered ({progressPercent}%)</span>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest px-1">Algorithm Index</h3>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {algos.map((algo) => {
                const isSelected = selectedAlgo === algo.id;
                const status = progress[algo.id] || 'Not Started';
                const badgeColor = 
                  status === 'Mastered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';

                return (
                  <button
                    key={algo.id}
                    onClick={() => {
                      setSelectedAlgo(algo.id);
                      setAnimStep(0);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/30 shadow-sm' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{algo.icon}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50">{algo.name}</h4>
                        <p className="text-[10px] text-zinc-450 mt-0.5 leading-tight">{algo.desc}</p>
                      </div>
                    </div>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProgress(algo.id);
                      }}
                      className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 transition-transform ${badgeColor}`}
                    >
                      {status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Simulation Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              
              {/* Header meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {algos.find(a => a.id === selectedAlgo)?.name} Sandbox
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
                    {activeDetails.purpose}
                  </p>
                </div>
                
                {/* Complexity badges */}
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Time</span>
                    <code className="text-xs font-bold text-indigo-500 dark:text-indigo-400">{activeDetails.timeComplexity}</code>
                  </div>
                  <div className="px-3 py-1 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Space</span>
                    <code className="text-xs font-bold text-purple-500 dark:text-purple-400">{activeDetails.spaceComplexity}</code>
                  </div>
                </div>
              </div>

              {/* Simulation Canvas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Simulation Screen</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => setAnimStep(0)}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <select
                      value={animSpeed}
                      onChange={(e) => setAnimSpeed(Number(e.target.value))}
                      className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs px-2 py-1 rounded-lg text-zinc-650 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value={2000}>Slow (2s)</option>
                      <option value={1000}>Normal (1s)</option>
                      <option value={500}>Fast (0.5s)</option>
                    </select>
                  </div>
                </div>

                {/* Animated frame */}
                <div className="h-48 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 rounded-2xl flex flex-col justify-center items-center p-6 relative overflow-hidden">
                  <div className="flex gap-4 items-center justify-center">
                    {activeDetails.visualSteps.map((step, idx) => {
                      const isActive = idx === animStep;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all duration-300 max-w-[140px] ${
                            isActive 
                              ? 'bg-indigo-500 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/20'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-600 opacity-60'
                          }`}
                        >
                          <span className="block text-[8px] opacity-75 font-bold uppercase tracking-wider mb-1">Step {idx + 1}</span>
                          {step}
                        </div>
                      );
                    })}
                  </div>

                  {/* Play pointer path */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-[10px] font-bold text-zinc-550 dark:text-zinc-400 px-3 py-1 bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-850 rounded-full select-none">
                      Active: {activeDetails.visualSteps[animStep]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Learning Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Why selected in EcoShare?</h4>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                    {activeDetails.whyUsed}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Real-life Industry Case Study</h4>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                    Used widely in {activeDetails.realLife}
                  </p>
                </div>
              </div>

              {/* Pros & Cons list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-150 dark:border-zinc-850">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Advantages</h4>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold list-inside list-disc">
                    {activeDetails.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                  </ul>
                </div>
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Disadvantages</h4>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold list-inside list-disc">
                    {activeDetails.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // Premium Recharts Analytics Dashboard View
  const VisualAnalyticsDashboard: React.FC = () => {
    const { theme } = useTheme();

    // Data mocks matching system telemetry
    const areaData = [
      { name: 'Mon', gordon: 30, union: 24 },
      { name: 'Tue', gordon: 45, union: 35 },
      { name: 'Wed', gordon: 60, union: 40 },
      { name: 'Thu', gordon: 50, union: 48 },
      { name: 'Fri', gordon: 80, union: 55 },
      { name: 'Sat', gordon: 95, union: 60 },
      { name: 'Sun', gordon: 110, union: 75 }
    ];

    const lineData = [
      { name: 'Day 1', carbon: 20 },
      { name: 'Day 2', carbon: 35 },
      { name: 'Day 3', carbon: 50 },
      { name: 'Day 4', carbon: 45 },
      { name: 'Day 5', carbon: 70 },
      { name: 'Day 6', carbon: 85 },
      { name: 'Day 7', carbon: 105 }
    ];

    const pieData = [
      { name: 'Cooked Meals', value: 400, color: '#10b981' },
      { name: 'Bakery', value: 300, color: '#6366f1' },
      { name: 'Fresh Produce', value: 300, color: '#f59e0b' },
      { name: 'Dairy & Canned', value: 200, color: '#ec4899' }
    ];

    const barData = [
      { name: 'Mon', rescued: 15, wasted: 4 },
      { name: 'Tue', rescued: 22, wasted: 3 },
      { name: 'Wed', rescued: 30, wasted: 6 },
      { name: 'Thu', rescued: 28, wasted: 2 },
      { name: 'Fri', rescued: 45, wasted: 8 },
      { name: 'Sat', rescued: 50, wasted: 5 },
      { name: 'Sun', rescued: 65, wasted: 4 }
    ];

    const radarData = [
      { subject: 'Response Time', A: 120, B: 110, fullMark: 150 },
      { subject: 'Route Efficiency', A: 98, B: 130, fullMark: 150 },
      { subject: 'Claim Volume', A: 86, B: 130, fullMark: 150 },
      { subject: 'Perishables Speed', A: 99, B: 100, fullMark: 150 },
      { subject: 'Delivery Success', A: 85, B: 90, fullMark: 150 }
    ];

    const radialData = [
      { name: 'Carbon Target', value: 78, fill: '#10b981' },
      { name: 'Meals Target', value: 85, fill: '#6366f1' },
      { name: 'NGO Active Target', value: 65, fill: '#f59e0b' }
    ];

    const treemapData = [
      { name: 'Grain Chaining', size: 400 },
      { name: 'Protein Packing', size: 300 },
      { name: 'Vegetable Lots', size: 250 },
      { name: 'Desserts Leftovers', size: 150 },
      { name: 'Bread Diverts', size: 120 }
    ];

    // Calendar Heatmap simulated cells: 4 weeks x 7 days
    const calendarWeeks = [
      [8, 12, 5, 20, 15, 0, 4],
      [14, 9, 22, 6, 18, 5, 11],
      [25, 30, 17, 12, 8, 4, 15],
      [19, 22, 10, 5, 35, 12, 8]
    ];

    const gridStroke = theme === 'dark' ? '#27272a' : '#e4e4e7';
    const tooltipStyle = {
      backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
      border: `1px solid ${theme === 'dark' ? '#27272a' : '#e4e4e7'}`,
      borderRadius: '12px',
      color: theme === 'dark' ? '#f4f4f5' : '#18181b',
      fontSize: '12px'
    };

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Sparkline KPI Cards Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Meals Rescued Today</span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">1,240</h3>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">↑ 12% week over week</span>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:10},{v:15},{v:12},{v:18},{v:22},{v:30}]}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Carbon Equivalent Saved</span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">842 kg</h3>
              <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">↑ 8% from yesterday</span>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:30},{v:25},{v:35},{v:32},{v:40},{v:48}]}>
                  <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Active Dispatch Riders</span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">48 Online</h3>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">↑ 15% volunteer hours</span>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:5},{v:12},{v:8},{v:20},{v:15},{v:28}]}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Row 1: Area Chart & Target Progress circles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Diverted Food Weight Trend</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-450">Chronological volumes logged by campus dining kitchens.</p>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded">Weekly</span>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorGordon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Gordon Kitchen" type="monotone" dataKey="gordon" stroke="#10b981" fillOpacity={1} fill="url(#colorGordon)" />
                  <Area name="Union Cafe" type="monotone" dataKey="union" stroke="#6366f1" fillOpacity={1} fill="url(#colorUnion)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Milestone Progress Rings</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">Aggregate target goals matched today.</p>
            </div>
            
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={radialData}>
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={5}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-[10px] font-bold text-zinc-550 dark:text-zinc-400 pt-2 border-t border-zinc-150 dark:border-zinc-850">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Carbon</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span>Meals</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>NGOs</span>
            </div>
          </div>

        </div>

        {/* Row 2: Stacked Bar Chart & Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Diverted vs Wasted Surplus</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-6">Comparison volume ratios of meals rescued vs meals discarded.</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar name="Meals Rescued (kg)" dataKey="rescued" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar name="Meals Wasted (kg)" dataKey="wasted" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Volunteer Performance Dimensions</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-6">Metrics tracking active dispatches efficiencies indices.</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke={gridStroke} />
                  <PolarAngleAxis dataKey="subject" stroke="#888888" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#888888" fontSize={9} />
                  <Radar name="Active Fleet" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Row 2.5: Carbon Savings Trend (Animated Line Chart) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Carbon Reduction Impact (Animated Line Chart)</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-6">Chronological tracking of carbon emissions prevented (kg CO2e).</p>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  name="Carbon Prevented (kg)" 
                  type="monotone" 
                  dataKey="carbon" 
                  stroke="url(#lineColor)" 
                  strokeWidth={3.5} 
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Treemap & Pie Chart (Donut) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Diverted Category Treemap</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-6">Proportional weights density mapping categories.</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  stroke={theme === 'dark' ? '#18181b' : '#ffffff'}
                  fill="#6366f1"
                />
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Donation Category Split</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-450">Distribution of rescued food categories.</p>
            </div>
            
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 pt-4 border-t border-zinc-150 dark:border-zinc-850">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span>{d.name} ({Math.round((d.value / 1200) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Row 4: Calendar Heatmap */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Donation Frequency Grid (Calendar Heatmap)</h4>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">Logs intensity mapping of daily completed dispatches.</p>
          </div>

          <div className="flex flex-col gap-1.5 overflow-x-auto pr-2 pb-2 custom-scrollbar">
            {calendarWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex gap-1.5 min-w-[350px]">
                <span className="text-[10px] text-zinc-450 w-12 font-bold select-none py-1">Week {wIdx + 1}</span>
                {week.map((val, dIdx) => {
                  // Determine shade density matching value
                  const bgClass = 
                    val === 0 ? 'bg-zinc-100 dark:bg-zinc-850' :
                    val < 10 ? 'bg-emerald-500/10 border-emerald-500/20' :
                    val < 20 ? 'bg-emerald-500/30 border-emerald-500/40' :
                    val < 30 ? 'bg-emerald-500/60 border-emerald-500/70' :
                    'bg-emerald-500 text-white';

                  return (
                    <div
                      key={dIdx}
                      title={`Volume: ${val} kg`}
                      className={`h-7 w-7 rounded-lg border flex items-center justify-center text-[9px] font-bold cursor-pointer select-none hover:scale-105 active:scale-95 transition-all ${bgClass}`}
                    >
                      {val > 0 && val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex gap-4 text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-850">
            <span>Color Density Key:</span>
            <span className="flex items-center gap-1"><span className="h-3.5 w-3.5 rounded bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800"></span> 0 kg</span>
            <span className="flex items-center gap-1"><span className="h-3.5 w-3.5 rounded bg-emerald-500/20 border border-emerald-500/30"></span> 1-10 kg</span>
            <span className="flex items-center gap-1"><span className="h-3.5 w-3.5 rounded bg-emerald-500/50 border border-emerald-500/60"></span> 11-29 kg</span>
            <span className="flex items-center gap-1"><span className="h-3.5 w-3.5 rounded bg-emerald-500 border"></span> 30+ kg</span>
          </div>
        </div>

      </div>
    );
  };

  if (user?.role === 'Student') {
    const studentFilteredFoods = getFilteredAvailableFoods();
    const activeClaims = reservedFoods.filter(f => f.status === 'Reserved');
    const pastCollections = reservedFoods.filter(f => f.status === 'Collected');

    const studentTabs = [
      { id: 'overview', label: 'Browse Food', icon: Utensils },
      { id: 'reservations', label: 'My Reservations', icon: FileSpreadsheet },
      { id: 'command_center', label: 'Command Center', icon: Activity },
      { id: 'transit_map', label: 'Transit Map', icon: Compass },
      { id: 'analytics', label: 'Impact Analytics', icon: LayoutDashboard },
      { id: 'dsa_learning', label: 'DSA Learning', icon: BookOpen },
      { id: 'profile', label: 'My Profile', icon: User },
    ];

    return (
      <DashboardLayout
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={studentTabs}
        onLogout={logout}
        extraHeaderAction={
          activeClaims.length > 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
              {activeClaims.length} Claim{activeClaims.length > 1 ? 's' : ''} Active
            </span>
          ) : undefined
        }
      >
        <AnimatePresence mode="wait">
            
            {/* Student Overview tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="student-overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Greeting Hero & KPI Grid */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Hello, {user?.name} 👋
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                        Claim excess meals from kitchens around campus to reduce food waste. Verify the pickup time slots and claim details below.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <motion.div 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-4 text-center min-w-[100px]"
                      >
                        <span className="block text-2xl font-black text-emerald-500">{studentFilteredFoods.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available</span>
                      </motion.div>
                      <motion.div 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-4 text-center min-w-[100px]"
                      >
                        <span className="block text-2xl font-black text-amber-500">{activeClaims.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reserved</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Student KPI Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProgressRing 
                      percentage={Math.min(Math.round(((pastCollections.length || 1) / 5) * 100), 100)} 
                      label="Monthly Rescue Target" 
                      colorClass="text-emerald-500" 
                    />
                    <div className="md:col-span-2">
                      <MiniAreaChart 
                        data={[2, 6, 12, 10, 16, Math.max(pastCollections.length * 3, 20)]} 
                        title="Rescued Food Equivalent" 
                        subtitle="Equivalent mass of carbon-diverted meals" 
                        colorTheme="indigo" 
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search surplus food..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <select
                      value={studentCategory}
                      onChange={e => setStudentCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Veg / Non-Veg */}
                  <div>
                    <select
                      value={studentVegFilter}
                      onChange={e => setStudentVegFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Diets (Veg / Non-Veg)</option>
                      <option value="Veg">Vegetarian Only</option>
                      <option value="Non-Veg">Non-Vegetarian Only</option>
                    </select>
                  </div>

                  {/* Sorting */}
                  <div>
                    <select
                      value={studentSortBy}
                      onChange={e => setStudentSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="pickup">Sort: Pickup Time</option>
                      <option value="quantity">Sort: High Quantity</option>
                    </select>
                  </div>
                </div>

                {/* Available Listing Grid */}
                {loadingAvailable && availableFoods.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(n => (
                      <CardSkeleton key={n} />
                    ))}
                  </div>
                ) : studentFilteredFoods.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <Utensils className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No surplus food available</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                      Check back later! Kitchens post fresh surplus meals throughout the day.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentFilteredFoods.map(food => {
                      const cleanDesc = getCleanDescription(food.description);
                      const vegTag = getVegBadge(food.description);
                      const pickupTime = getPickupHours(food.description);
                      return (
                        <div 
                          key={food._id}
                          className="glass-panel apple-shadow interactive-card rounded-2xl overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative">
                            {food.image && (
                              <img 
                                src={food.image} 
                                alt={food.title} 
                                className="h-44 w-full object-cover"
                              />
                            )}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                              {vegTag && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                                  vegTag === 'Veg' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                  {vegTag}
                                </span>
                              )}
                              <PremiumBadge status={food.status} />
                            </div>
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="inline-block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                {food.category}
                              </span>
                              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base leading-snug truncate">
                                {food.title}
                              </h3>
                              <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                                {cleanDesc}
                              </p>
                              
                              <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span>Quantity: <strong className="text-zinc-800 dark:text-zinc-200">{food.quantity} {food.unit}</strong></span>
                                </div>
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span className="truncate" title={food.pickupLocation}>{food.pickupLocation}</span>
                                </div>
                                {pickupTime && (
                                  <div className="flex items-center text-xs text-zinc-500 gap-2">
                                    <Clock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>Pickup Window: {pickupTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedFoodDetails(food)}
                              className="w-full mt-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/10 cursor-pointer text-center block"
                            >
                              View & Claim Surplus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <AlgorithmsInAction defaultAlgo="binary_search" />
              </motion.div>
            )}
            {activeTab === 'command_center' && (
              <motion.div
                key="student-command-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <LiveCommandCenter />
              </motion.div>
            )}
            {activeTab === 'transit_map' && (
              <motion.div
                key="student-transit-map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RedistributionMap />
              </motion.div>
            )}
            {activeTab === 'dsa_learning' && (
              <motion.div
                key="student-dsa-learning"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DsaLearningCenter />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="student-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <VisualAnalyticsDashboard />
              </motion.div>
            )}

            {/* Student Reservations tab */}
            {activeTab === 'reservations' && (
              <motion.div
                key="student-reservations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    My Claims & Reservations
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                    Track your current claims, collected meals, and history.
                  </p>
                </div>

                {loadingReserved && reservedFoods.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-28 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : (reservedFoods.length === 0 && cancelledHistory.length === 0) ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <FileSpreadsheet className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No reservations claimed</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1 mb-4">
                      You haven't reserved any surplus listings yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-150 dark:text-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-xl"
                    >
                      Browse Surplus Meals
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    
                    {/* Active Claims Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                        Active Reservations ({activeClaims.length})
                      </h3>
                      {activeClaims.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No currently active reservations.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {activeClaims.map(food => {
                            const cleanDesc = getCleanDescription(food.description);
                            const vegTag = getVegBadge(food.description);
                            const pickupTime = getPickupHours(food.description);
                            return (
                              <div 
                                key={food._id}
                                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-zinc-300 transition-all"
                              >
                                <div className="flex gap-4 items-start">
                                  {food.image && (
                                    <img src={food.image} alt={food.title} className="h-16 w-16 rounded-xl object-cover border dark:border-zinc-800 flex-shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base leading-snug">{food.title}</h4>
                                      {vegTag && (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                          vegTag === 'Veg' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                        }`}>{vegTag}</span>
                                      )}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1">{cleanDesc}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-2 text-xs text-zinc-400">
                                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-450" /> {food.pickupLocation}</span>
                                      {pickupTime && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-zinc-450" /> Pickup Slot: {pickupTime}</span>}
                                      <span>Qty: <strong>{food.quantity} {food.unit}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex sm:flex-row gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-3 md:mt-0">
                                  <button
                                    onClick={() => handleCancelReservation(food)}
                                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-bold rounded-xl cursor-pointer"
                                  >
                                    Cancel Reservation
                                  </button>
                                  <button
                                    onClick={() => handleCollectFood(food)}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Mark Collected
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Collected History */}
                    <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                        Collected Surplus Meals ({pastCollections.length})
                      </h3>
                      {pastCollections.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No collected items logged.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {pastCollections.map(food => (
                            <div key={food._id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900/50 flex items-center justify-between opacity-80 hover:opacity-100 transition-all">
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{food.title}</h4>
                                <div className="flex gap-4 text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                                  <span>Quantity: {food.quantity} {food.unit}</span>
                                  <span>•</span>
                                  <span>Collected Date: {new Date(food.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Collected
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cancelled History */}
                    <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                        Cancelled Claims ({cancelledHistory.length})
                      </h3>
                      {cancelledHistory.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No cancelled claims logged.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {cancelledHistory.map((item, index) => (
                            <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900/40 flex items-center justify-between opacity-60">
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{item.title}</h4>
                                <div className="flex gap-4 text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                                  <span>Quantity: {item.quantity} {item.unit}</span>
                                  <span>•</span>
                                  <span>Cancelled Date: {new Date(item.cancelledAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-850 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Cancelled
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* Student Profile tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="student-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 relative flex items-end p-6">
                  <div className="absolute bottom-[-32px] left-6 h-20 w-20 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center font-extrabold text-3xl text-zinc-700 dark:text-zinc-300">
                    {user?.name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>

                <div className="pt-12 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</h2>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      {user?.role} Member
                    </span>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Email Address</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">{user?.email}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Member Since</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Workspace Status</span>
                      <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Active Live System
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center">
                    <button
                      onClick={logout}
                      className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Sign Out Account
                    </button>
                    <p className="text-[11px] text-zinc-400 font-medium">EcoShare V1.0.0 Foundation</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        {/* Food Details Modal Overlay */}
        <AnimatePresence>
          {selectedFoodDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
              onClick={() => setSelectedFoodDetails(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  {selectedFoodDetails.image && (
                    <div className="h-48 relative">
                      <img src={selectedFoodDetails.image} alt={selectedFoodDetails.title} className="h-full w-full object-cover" />
                      <div className="absolute top-4 right-4 flex gap-1.5">
                        {getVegBadge(selectedFoodDetails.description) && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-sm ${
                            getVegBadge(selectedFoodDetails.description) === 'Veg' 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : 'bg-red-500 text-white border-red-500'
                          }`}>{getVegBadge(selectedFoodDetails.description)}</span>
                        )}
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold border border-emerald-400 uppercase tracking-wider shadow-sm">
                          Available
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{selectedFoodDetails.category}</span>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{selectedFoodDetails.title}</h3>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Restaurant / Kitchen</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                          {selectedFoodDetails.createdBy?.name || 'Campus Kitchen Staff'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Description</span>
                        <span className="col-span-2 text-zinc-700 dark:text-zinc-300 font-medium">
                          {getCleanDescription(selectedFoodDetails.description)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Quantity Left</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-bold">
                          {selectedFoodDetails.quantity} {selectedFoodDetails.unit}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Pickup Address</span>
                        <span className="col-span-2 text-zinc-700 dark:text-zinc-300 font-medium inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                          {selectedFoodDetails.pickupLocation}
                        </span>
                      </div>
                      {getPickupHours(selectedFoodDetails.description) && (
                        <div className="grid grid-cols-3 text-xs leading-relaxed">
                          <span className="text-zinc-400 font-medium">Pickup Window</span>
                          <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            {getPickupHours(selectedFoodDetails.description)}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Expires At</span>
                        <span className="col-span-2 text-zinc-650 dark:text-zinc-300 font-semibold font-mono">
                          {new Date(selectedFoodDetails.expiryTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                  <button
                    onClick={() => setSelectedFoodDetails(null)}
                    className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReserveFood(selectedFoodDetails._id)}
                    disabled={actionLoadingIds.includes(selectedFoodDetails._id)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {actionLoadingIds.includes(selectedFoodDetails._id) && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Confirm Claim Reservation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  if (user?.role === 'NGO') {
    const ngoFilteredFoods = getFilteredAvailableFoods();
    const activeClaims = reservedFoods.filter(f => f.status === 'Reserved');
    const pastPickups = reservedFoods.filter(f => f.status === 'Collected');

    const ngoTabs = [
      { id: 'overview', label: 'Browse Donations', icon: Utensils },
      { id: 'reservations', label: 'My Donations', icon: FileSpreadsheet },
      { id: 'command_center', label: 'Command Center', icon: Activity },
      { id: 'transit_map', label: 'Transit Map', icon: Compass },
      { id: 'analytics', label: 'Impact Analytics', icon: LayoutDashboard },
      { id: 'dsa_learning', label: 'DSA Learning', icon: BookOpen },
      { id: 'profile', label: 'NGO Profile', icon: User },
    ];

    return (
      <DashboardLayout
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={ngoTabs}
        onLogout={logout}
        extraHeaderAction={
          activeClaims.length > 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {activeClaims.length} Claim{activeClaims.length > 1 ? 's' : ''} Claimed
            </span>
          ) : undefined
        }
      >
        <AnimatePresence mode="wait">
            
            {/* NGO Overview tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="ngo-overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Upgraded Greeting Hero & KPI Grid */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Hello, {user?.name} 🤝
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                        Claim bulk surplus food donations from restaurants and campus kitchens to redistribute to local food banks and community shelters.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <motion.div 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-4 text-center min-w-[100px]"
                      >
                        <span className="block text-2xl font-black text-emerald-500">{ngoFilteredFoods.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available Bulk</span>
                      </motion.div>
                      <motion.div 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-4 text-center min-w-[100px]"
                      >
                        <span className="block text-2xl font-black text-amber-500">{activeClaims.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Claims Active</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* NGO Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProgressRing 
                      percentage={Math.min(Math.round(((pastPickups.length || 1) / 5) * 100), 100)} 
                      label="Monthly Distribution Target" 
                      colorClass="text-sky-500" 
                    />
                    <div className="md:col-span-2">
                      <MiniAreaChart 
                        data={[15, 30, 45, 20, 60, Math.max(pastPickups.length * 15, 50)]} 
                        title="Diverted Bulk Food Saved" 
                        subtitle="Equivalent mass of carbon-diverted meals" 
                        colorTheme="sky" 
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search bulk donations..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <select
                      value={studentCategory}
                      onChange={e => setStudentCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Veg / Non-Veg */}
                  <div>
                    <select
                      value={studentVegFilter}
                      onChange={e => setStudentVegFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Diets (Veg / Non-Veg)</option>
                      <option value="Veg">Vegetarian Only</option>
                      <option value="Non-Veg">Non-Vegetarian Only</option>
                    </select>
                  </div>

                  {/* Sorting */}
                  <div>
                    <select
                      value={studentSortBy}
                      onChange={e => setStudentSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="pickup">Sort: Pickup Time</option>
                      <option value="quantity">Sort: High Quantity</option>
                    </select>
                  </div>
                </div>

                {/* Available Listing Grid */}
                {loadingAvailable && availableFoods.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(n => (
                      <CardSkeleton key={n} />
                    ))}
                  </div>
                ) : ngoFilteredFoods.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <Utensils className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No surplus donations available</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                      Check back later! Restaurants post fresh surplus meals throughout the day.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ngoFilteredFoods.map(food => {
                      const cleanDesc = getCleanDescription(food.description);
                      const vegTag = getVegBadge(food.description);
                      const pickupTime = getPickupHours(food.description);
                      return (
                        <div 
                          key={food._id}
                          className="glass-panel apple-shadow interactive-card rounded-2xl overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative">
                            {food.image && (
                              <img 
                                src={food.image} 
                                alt={food.title} 
                                className="h-44 w-full object-cover"
                              />
                            )}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                              {vegTag && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                                  vegTag === 'Veg' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                  {vegTag}
                                </span>
                              )}
                              <PremiumBadge status={food.status} />
                            </div>
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="inline-block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                {food.category}
                              </span>
                              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base leading-snug truncate">
                                {food.title}
                              </h3>
                              <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                                {cleanDesc}
                              </p>
                              
                              <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span>Quantity: <strong className="text-zinc-800 dark:text-zinc-200">{food.quantity} {food.unit}</strong></span>
                                </div>
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span className="truncate" title={food.pickupLocation}>{food.pickupLocation}</span>
                                </div>
                                {pickupTime && (
                                  <div className="flex items-center text-xs text-zinc-500 gap-2">
                                    <Clock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>Pickup window: {pickupTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedFoodDetails(food)}
                              className="w-full mt-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/10 cursor-pointer text-center block"
                            >
                              View & Claim Donation
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <AlgorithmsInAction defaultAlgo="dijkstra" />
              </motion.div>
            )}
            {activeTab === 'command_center' && (
              <motion.div
                key="ngo-command-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <LiveCommandCenter />
              </motion.div>
            )}
            {activeTab === 'transit_map' && (
              <motion.div
                key="ngo-transit-map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RedistributionMap />
              </motion.div>
            )}
            {activeTab === 'dsa_learning' && (
              <motion.div
                key="ngo-dsa-learning"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DsaLearningCenter />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="ngo-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <VisualAnalyticsDashboard />
              </motion.div>
            )}

            {/* NGO Reservations tab */}
            {activeTab === 'reservations' && (
              <motion.div
                key="ngo-reservations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    My Donations claimed
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                    Track claimed food shipments, pickups completed, and cancellation history.
                  </p>
                </div>

                {loadingReserved && reservedFoods.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-28 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : (reservedFoods.length === 0 && cancelledHistory.length === 0) ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <FileSpreadsheet className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No donations claimed</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1 mb-4">
                      You haven't claimed any surplus donations yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-150 dark:text-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-xl"
                    >
                      Browse Bulk Donations
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    
                    {/* Active Claims Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                        Active Claims ({activeClaims.length})
                      </h3>
                      {activeClaims.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No active bulk donation claims.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {activeClaims.map(food => {
                            const cleanDesc = getCleanDescription(food.description);
                            const vegTag = getVegBadge(food.description);
                            const pickupTime = getPickupHours(food.description);
                            return (
                              <div 
                                key={food._id}
                                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-zinc-300 transition-all"
                              >
                                <div className="flex gap-4 items-start">
                                  {food.image && (
                                    <img src={food.image} alt={food.title} className="h-16 w-16 rounded-xl object-cover border dark:border-zinc-800 flex-shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base leading-snug">{food.title}</h4>
                                      {vegTag && (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                          vegTag === 'Veg' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                        }`}>{vegTag}</span>
                                      )}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1">{cleanDesc}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-2 text-xs text-zinc-400">
                                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-450" /> {food.pickupLocation}</span>
                                      {pickupTime && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-zinc-450" /> Slot: {pickupTime}</span>}
                                      <span>Qty: <strong>{food.quantity} {food.unit}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex sm:flex-row gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-3 md:mt-0">
                                  <button
                                    onClick={() => handleCancelReservation(food)}
                                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-bold rounded-xl cursor-pointer"
                                  >
                                    Cancel Claim
                                  </button>
                                  <button
                                    onClick={() => handleCollectFood(food)}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Mark Pickup Complete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Pickups Completed History */}
                    <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                        Completed Pickups ({pastPickups.length})
                      </h3>
                      {pastPickups.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No completed pickups yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {pastPickups.map(food => (
                            <div key={food._id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900/50 flex items-center justify-between opacity-80 hover:opacity-100 transition-all">
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{food.title}</h4>
                                <div className="flex gap-4 text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                                  <span>Quantity: {food.quantity} {food.unit}</span>
                                  <span>•</span>
                                  <span>Picked Up: {new Date(food.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Picked Up
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cancelled Claims History */}
                    <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                        Cancelled Claims ({cancelledHistory.length})
                      </h3>
                      {cancelledHistory.length === 0 ? (
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 italic pl-4">No cancelled claims.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {cancelledHistory.map((item, index) => (
                            <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900/40 flex items-center justify-between opacity-60">
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{item.title}</h4>
                                <div className="flex gap-4 text-xs text-zinc-555 dark:text-zinc-400 mt-1">
                                  <span>Quantity: {item.quantity} {item.unit}</span>
                                  <span>•</span>
                                  <span>Cancelled: {new Date(item.cancelledAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-850 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Cancelled
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* NGO Profile tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="ngo-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 relative flex items-end p-6">
                  <div className="absolute bottom-[-32px] left-6 h-20 w-20 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center font-extrabold text-3xl text-zinc-700 dark:text-zinc-300">
                    {user?.name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>

                <div className="pt-12 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</h2>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      {user?.role} Organization
                    </span>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Email Address</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">{user?.email}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Registered Since</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Workspace Status</span>
                      <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Active Live System
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center">
                    <button
                      onClick={logout}
                      className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Sign Out NGO Account
                    </button>
                    <p className="text-[11px] text-zinc-400 font-medium">EcoShare V1.0.0 Foundation</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        {/* Food Details Modal Overlay */}
        <AnimatePresence>
          {selectedFoodDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
              onClick={() => setSelectedFoodDetails(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  {selectedFoodDetails.image && (
                    <div className="h-48 relative">
                      <img src={selectedFoodDetails.image} alt={selectedFoodDetails.title} className="h-full w-full object-cover" />
                      <div className="absolute top-4 right-4 flex gap-1.5">
                        {getVegBadge(selectedFoodDetails.description) && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-sm ${
                            getVegBadge(selectedFoodDetails.description) === 'Veg' 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : 'bg-red-500 text-white border-red-500'
                          }`}>{getVegBadge(selectedFoodDetails.description)}</span>
                        )}
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold border border-emerald-400 uppercase tracking-wider shadow-sm">
                          Available
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{selectedFoodDetails.category}</span>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{selectedFoodDetails.title}</h3>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Donor Restaurant</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                          {selectedFoodDetails.createdBy?.name || 'Campus Kitchen Staff'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Donor Contact</span>
                        <span className="col-span-2 text-zinc-850 dark:text-zinc-300 font-semibold font-mono">
                          {selectedFoodDetails.createdBy?.email || 'contact@ecoshare.com'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Description</span>
                        <span className="col-span-2 text-zinc-700 dark:text-zinc-300 font-medium">
                          {getCleanDescription(selectedFoodDetails.description)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Bulk Quantity</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-bold">
                          {selectedFoodDetails.quantity} {selectedFoodDetails.unit}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Pickup Address</span>
                        <span className="col-span-2 text-zinc-700 dark:text-zinc-300 font-medium inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                          {selectedFoodDetails.pickupLocation}
                        </span>
                      </div>
                      {getPickupHours(selectedFoodDetails.description) && (
                        <div className="grid grid-cols-3 text-xs leading-relaxed">
                          <span className="text-zinc-400 font-medium">Pickup Window</span>
                          <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            {getPickupHours(selectedFoodDetails.description)}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-3 text-xs leading-relaxed">
                        <span className="text-zinc-400 font-medium">Expires At</span>
                        <span className="col-span-2 text-zinc-650 dark:text-zinc-300 font-semibold font-mono">
                          {new Date(selectedFoodDetails.expiryTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                  <button
                    onClick={() => setSelectedFoodDetails(null)}
                    className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReserveFood(selectedFoodDetails._id)}
                    disabled={actionLoadingIds.includes(selectedFoodDetails._id)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {actionLoadingIds.includes(selectedFoodDetails._id) && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Confirm Claim Donation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  if (user?.role === 'Admin') {
    const adminFilteredUsers = getFilteredUsers();
    const adminFilteredListings = getFilteredSystemListings();

    // Compute stats
    const totalListings = systemListings.length;
    const activeListings = systemListings.filter(l => l.status === 'Available').length;
    const reservedListings = systemListings.filter(l => l.status === 'Reserved').length;
    const collectedListings = systemListings.filter(l => l.status === 'Collected').length;

    const adminTabs = [
      { id: 'overview', label: 'System Overview', icon: ShieldAlert },
      { id: 'command_center', label: 'Command Center', icon: Activity },
      { id: 'transit_map', label: 'Transit Map', icon: Compass },
      { id: 'analytics', label: 'Impact Analytics', icon: LayoutDashboard },
      { id: 'dsa_learning', label: 'DSA Learning', icon: BookOpen },
      { id: 'users', label: 'User Directory', icon: User },
      { id: 'listings', label: 'System Listings', icon: Utensils },
      { id: 'reports', label: 'System Reports', icon: FileSpreadsheet },
      { id: 'profile', label: 'Admin Profile', icon: User },
    ];

    return (
      <DashboardLayout
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={adminTabs}
        onLogout={logout}
      >
        <AnimatePresence mode="wait">
            
            {/* Overview / Analytics tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="admin-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Greeting Hero */}
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/10 dark:border-indigo-500/5 rounded-3xl p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Administrator Command Console 🎛️
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
                    EcoShare system health metrics, active listings, registration distributions, and live environmental rescue analytics.
                  </p>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Listings Logged', value: totalListings, icon: FileSpreadsheet, color: 'text-zinc-500 bg-zinc-500/10' },
                    { label: 'Active Food Listings', value: activeListings, icon: Clock, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Reserved / Claimed', value: reservedListings, icon: Compass, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Completed Pickups', value: collectedListings, icon: CheckCircle, color: 'text-sky-500 bg-sky-500/10' },
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <motion.div 
                        key={idx} 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-5 flex justify-between items-start cursor-default"
                      >
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                          <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                          <StatIcon className="h-5 w-5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* User Distribution list */}
                  <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">User Base Distribution</h3>
                    <div className="space-y-4">
                      {[
                        { role: 'Admin', count: usersList.filter(u => u.role === 'Admin').length, color: 'bg-indigo-500' },
                        { role: 'Kitchen Staff', count: usersList.filter(u => u.role === 'Kitchen Staff').length, color: 'bg-emerald-500' },
                        { role: 'Student', count: usersList.filter(u => u.role === 'Student').length, color: 'bg-amber-500' },
                        { role: 'NGO', count: usersList.filter(u => u.role === 'NGO').length, color: 'bg-sky-500' },
                        { role: 'Volunteer', count: usersList.filter(u => u.role === 'Volunteer').length, color: 'bg-purple-500' },
                      ].map((item, idx) => {
                        const percent = usersList.length ? Math.round((item.count / usersList.length) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-zinc-650 dark:text-zinc-350">
                              <span>{item.role}</span>
                              <span>{item.count} ({percent}%)</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Impact charts panel */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <ProgressRing 
                        percentage={totalListings ? Math.round(((reservedListings + collectedListings) / totalListings) * 100) : 0} 
                        label="Claim Matching Efficiency" 
                        colorClass="text-indigo-500" 
                      />
                      <MiniAreaChart 
                        data={[8, 16, 22, 18, 30, Math.max(totalListings, 15)]} 
                        title="Diverted Logistics Log" 
                        subtitle="System listings aggregate growth" 
                        colorTheme="indigo" 
                      />
                    </div>
                    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                        <Award className="h-4.5 w-4.5 text-zinc-500" /> Administrative Impact
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed mt-2">
                        Preventing food waste from landfills translates directly to reduced greenhouse gas emissions. Administrating this MERN network saves communities landfill tipping fees, rescues quality cooked meals, and reduces carbon footprint indices.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'command_center' && (
              <motion.div
                key="admin-command-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <LiveCommandCenter />
              </motion.div>
            )}
            {activeTab === 'transit_map' && (
              <motion.div
                key="admin-transit-map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RedistributionMap />
              </motion.div>
            )}
            {activeTab === 'dsa_learning' && (
              <motion.div
                key="admin-dsa-learning"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DsaLearningCenter />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="admin-analytics-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <VisualAnalyticsDashboard />
              </motion.div>
            )}

            {/* User Management tab */}
            {activeTab === 'users' && (
              <motion.div
                key="admin-users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    User Management Console
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                    Search registered accounts, modify roles, or remove accounts from the directory.
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={adminUserSearch}
                      onChange={e => setAdminUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Role filter */}
                  <div>
                    <select
                      value={adminUserRoleFilter}
                      onChange={e => setAdminUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Kitchen Staff">Kitchen Staff</option>
                      <option value="Student">Student</option>
                      <option value="NGO">NGO</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>
                </div>

                {/* Users List Table */}
                {loadingUsers && usersList.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="h-16 bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800 rounded-xl" />
                    ))}
                  </div>
                ) : adminFilteredUsers.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <User className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No users match filters</h4>
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-450 dark:text-zinc-500 uppercase font-semibold">
                          <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Member Since</th>
                            <th className="p-4">Role Authorization</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {adminFilteredUsers.map(usr => (
                            <tr key={usr._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                              <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">
                                {usr.name}
                              </td>
                              <td className="p-4 text-xs text-zinc-500 font-mono">{usr.email}</td>
                              <td className="p-4 text-xs text-zinc-455">{new Date(usr.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <select
                                  value={usr.role}
                                  onChange={e => handleUpdateUserRole(usr._id, e.target.value)}
                                  disabled={usr._id === user._id}
                                  className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
                                >
                                  <option value="Student">Student</option>
                                  <option value="Kitchen Staff">Kitchen Staff</option>
                                  <option value="NGO">NGO</option>
                                  <option value="Volunteer">Volunteer</option>
                                  <option value="Admin">Admin</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setAdminConfirmDeleteUserId(usr._id)}
                                  disabled={usr._id === user._id}
                                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer disabled:opacity-30"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <AlgorithmsInAction defaultAlgo="merge_sort" />
              </motion.div>
            )}

            {/* Food Listings Management tab */}
            {activeTab === 'listings' && (
              <motion.div
                key="admin-listings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Food Listings Directory
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                    Overview of all posted surplus meals in the network. Delete expired or improper listings.
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search food by title..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Status filter */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Collected">Collected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="quantity-desc">Quantity: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Listings table view */}
                {loadingSystemListings && systemListings.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-16 bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800 rounded-xl" />
                    ))}
                  </div>
                ) : adminFilteredListings.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <Utensils className="h-12 w-12 text-zinc-455 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No listings found</h4>
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-450 dark:text-zinc-500 uppercase font-semibold">
                          <tr>
                            <th className="p-4">Listing Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Owner / Restaurant</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {adminFilteredListings.map(item => (
                            <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                              <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">
                                {item.title}
                              </td>
                              <td className="p-4 text-xs text-zinc-500">{item.category}</td>
                              <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-350">{item.quantity} {item.unit}</td>
                              <td className="p-4 text-xs text-zinc-550 max-w-xs truncate">{item.pickupLocation}</td>
                              <td className="p-4 text-xs text-zinc-650 dark:text-zinc-400 font-semibold">{item.createdBy?.name || 'Restaurant'}</td>
                              <td className="p-4">
                                <PremiumBadge status={item.status} />
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleAdminDeleteListing(item._id)}
                                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reports Page tab */}
            {activeTab === 'reports' && (
              <motion.div
                key="admin-reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      System Audit Reports
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                      Generate and export operational system logs of surplus distributions.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toast('success', 'Operational log exported as CSV successfully!')}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => toast('success', 'Operational log exported as PDF successfully!')}
                      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-150 dark:text-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Audit Grid list */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-450 dark:text-zinc-500 uppercase font-semibold">
                        <tr>
                          <th className="p-4">Report Code</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Total Weight Saved</th>
                          <th className="p-4">Completed Items</th>
                          <th className="p-4">Claims Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                          { code: 'RPT-MEALS-01', desc: 'Cooked Surplus Redistribution Report', weight: `${systemListings.filter(l => l.category === 'Cooked Meals' && l.status === 'Collected').reduce((acc, curr) => acc + curr.quantity, 0)} kg`, completed: systemListings.filter(l => l.category === 'Cooked Meals' && l.status === 'Collected').length, active: systemListings.filter(l => l.category === 'Cooked Meals' && l.status === 'Reserved').length },
                          { code: 'RPT-GROC-02', desc: 'Raw & Grocery Redistribution Report', weight: `${systemListings.filter(l => (l.category === 'Groceries' || l.category === 'Raw Ingredients') && l.status === 'Collected').reduce((acc, curr) => acc + curr.quantity, 0)} kg`, completed: systemListings.filter(l => (l.category === 'Groceries' || l.category === 'Raw Ingredients') && l.status === 'Collected').length, active: systemListings.filter(l => (l.category === 'Groceries' || l.category === 'Raw Ingredients') && l.status === 'Reserved').length },
                          { code: 'RPT-OTH-03', desc: 'Others & Baked Goods Audit Logs', weight: `${systemListings.filter(l => (l.category === 'Baked Goods' || l.category === 'Others') && l.status === 'Collected').reduce((acc, curr) => acc + curr.quantity, 0)} kg`, completed: systemListings.filter(l => (l.category === 'Baked Goods' || l.category === 'Others') && l.status === 'Collected').length, active: systemListings.filter(l => (l.category === 'Baked Goods' || l.category === 'Others') && l.status === 'Reserved').length },
                        ].map((rpt, i) => (
                          <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                            <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50 font-mono text-xs">{rpt.code}</td>
                            <td className="p-4 text-xs font-semibold text-zinc-650 dark:text-zinc-300">{rpt.desc}</td>
                            <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{rpt.weight}</td>
                            <td className="p-4 text-zinc-700 dark:text-zinc-300 font-medium">{rpt.completed} completed</td>
                            <td className="p-4 text-zinc-700 dark:text-zinc-300 font-medium">{rpt.active} active</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Admin Profile tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="admin-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 relative flex items-end p-6">
                  <div className="absolute bottom-[-32px] left-6 h-20 w-20 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center font-extrabold text-3xl text-zinc-700 dark:text-zinc-300">
                    {user?.name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>

                <div className="pt-12 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</h2>
                    <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      {user?.role} Command Authorization
                    </span>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Email Address</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">{user?.email}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Admin Joined</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">System Status</span>
                      <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Active Live System
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center">
                    <button
                      onClick={logout}
                      className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Sign Out Admin Account
                    </button>
                    <p className="text-[11px] text-zinc-400 font-medium">EcoShare V1.0.0 Command Console</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        {/* User Account Deletion Confirmation Overlay */}
        <AnimatePresence>
          {adminConfirmDeleteUserId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
              onClick={() => setAdminConfirmDeleteUserId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete User Account?</h3>
                  <p className="text-xs text-zinc-505 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Are you sure you want to delete this user? Their account and records will be deleted immediately. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setAdminConfirmDeleteUserId(null)}
                    className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(adminConfirmDeleteUserId)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Delete User
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  const kitchenTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'Food Listings', icon: Utensils },
    { id: 'command_center', label: 'Command Center', icon: Activity },
    { id: 'transit_map', label: 'Transit Map', icon: Compass },
    { id: 'analytics', label: 'Impact Analytics', icon: LayoutDashboard },
    { id: 'dsa_learning', label: 'DSA Learning', icon: BookOpen },
    { id: 'profile', label: 'Kitchen Profile', icon: User },
  ];

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      tabs={kitchenTabs}
      onLogout={logout}
      extraHeaderAction={
        <button
          onClick={handleAddView}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Food</span>
        </button>
      }
    >
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loadingListings && foods.length === 0 ? (
          /* Skeletons load states */
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </div>
        ) : (
          /* Main Router-equivalent View switches */
          <AnimatePresence mode="wait">
            
            {/* Overview Section */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Overview Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Welcome Back, Kitchen Staff
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                      Log leftover surplus to distribute to local communities.
                    </p>
                  </div>
                </div>

                {/* Upgraded Dashboard KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Listings', value: totalListings, icon: FileSpreadsheet, color: 'text-zinc-500 bg-zinc-500/10' },
                    { label: 'Active Listings', value: activeListings, icon: Clock, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Reserved Listings', value: reservedListings, icon: Compass, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Completed Donations', value: completedDonations, icon: CheckCircle, color: 'text-sky-500 bg-sky-500/10' },
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <motion.div 
                        key={idx} 
                        className="glass-panel apple-shadow interactive-card rounded-2xl p-5 flex justify-between items-start cursor-default"
                      >
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                          <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                          <StatIcon className="h-5 w-5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Upgraded Kitchen Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent food listings */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent Logs</h3>
                      <button 
                        onClick={() => setActiveTab('listings')} 
                        className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-0.5 cursor-pointer"
                      >
                        View all listings
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {foods.length === 0 ? (
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white dark:bg-zinc-900/50">
                        <Utensils className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No food logged yet</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1 mb-4">
                          Log your kitchen's excess meals to support local food shelters.
                        </p>
                        <button
                          onClick={handleAddView}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl"
                        >
                          Create First Listing
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {foods.slice(0, 3).map(food => (
                          <div 
                            key={food._id}
                            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                          >
                            <div className="flex gap-4 items-center">
                              {food.image && (
                                <img 
                                  src={food.image} 
                                  alt={food.title} 
                                  className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                                />
                              )}
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 leading-snug">{food.title}</h4>
                                <div className="flex flex-wrap gap-2 items-center mt-1">
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{food.category}</span>
                                  <span className="text-[11px] text-zinc-300 dark:text-zinc-700">•</span>
                                  <span className="text-[11px] text-zinc-500">{food.quantity} {food.unit}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                              <PremiumBadge status={food.status} />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditView(food)}
                                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-lg cursor-pointer"
                                  aria-label="Edit Listing"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(food._id)}
                                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                  aria-label="Delete Listing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sidebar Impact & Charts column */}
                  <div className="space-y-6">
                    <ProgressRing 
                      percentage={Math.min(Math.round(((completedDonations || 1) / 5) * 100), 100)} 
                      label="Weekly Donated Target" 
                      colorClass="text-emerald-500" 
                    />
                    <MiniAreaChart 
                      data={[1, 3, 5, 2, 6, Math.max(totalListings, 8)]} 
                      title="Diverted Organic Waste" 
                      subtitle="Prevented mass carbon dioxide equivalent footprint" 
                      colorTheme="emerald" 
                    />
                    <ActivityTimeline items={[
                      { title: "Surplus Food Logged", time: "10m ago", desc: "Logged 15 kg cooked rice leftovers", icon: Utensils, colorClass: "emerald" },
                      { title: "Matched & Reserved", time: "2h ago", desc: "Claimed by Hope Food Charity NGO", icon: Compass, colorClass: "indigo" },
                      { title: "Donation Picked Up", time: "Yesterday", desc: "Collected by volunteer Dave K.", icon: CheckCircle, colorClass: "emerald" }
                    ]} />
                  </div>
                </div>
                <AlgorithmsInAction defaultAlgo="min_heap" />
              </motion.div>
            )}
            {activeTab === 'command_center' && (
              <motion.div
                key="kitchen-command-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <LiveCommandCenter />
              </motion.div>
            )}
            {activeTab === 'transit_map' && (
              <motion.div
                key="kitchen-transit-map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RedistributionMap />
              </motion.div>
            )}
            {activeTab === 'dsa_learning' && (
              <motion.div
                key="kitchen-dsa-learning"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DsaLearningCenter />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="kitchen-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <VisualAnalyticsDashboard />
              </motion.div>
            )}

            {/* Food Listings Search, filter, layouts View */}
            {activeTab === 'listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      My Logged Listings
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                      Displaying {filteredFoods.length} of {foods.length} total food listings.
                    </p>
                  </div>
                  
                  {/* View layout toggles */}
                  <div className="flex border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                    <button
                      onClick={() => setViewLayout('grid')}
                      className={`p-2 cursor-pointer transition-colors ${viewLayout === 'grid' ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-700'}`}
                      aria-label="Grid View"
                    >
                      <Grid className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setViewLayout('table')}
                      className={`p-2 cursor-pointer transition-colors ${viewLayout === 'table' ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-700'}`}
                      aria-label="Table View"
                    >
                      <List className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Filtering controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                  {/* Search input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Category filter */}
                  <div>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Cooked Meals">Cooked Meals</option>
                      <option value="Baked Goods">Baked Goods</option>
                      <option value="Raw Ingredients">Raw Ingredients</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Collected">Collected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {/* Sort dropdown */}
                  <div>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="quantity-desc">Quantity: High to Low</option>
                      <option value="expiry-soon">Expiry: Soonest</option>
                    </select>
                  </div>
                </div>

                {/* Empty State */}
                {filteredFoods.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center bg-white dark:bg-zinc-900/40">
                    <SlidersHorizontal className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">No listings match filters</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                      Try clearing your search query or selecting a different status filter.
                    </p>
                  </div>
                ) : viewLayout === 'grid' ? (
                  /* Food Cards Grid View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map(food => {
                      const cleanDesc = getCleanDescription(food.description);
                      const vegTag = getVegBadge(food.description);
                      const pickupTime = getPickupHours(food.description);
                      return (
                        <div 
                          key={food._id}
                          className="glass-panel apple-shadow interactive-card rounded-2xl overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative">
                            {food.image && (
                              <img 
                                src={food.image} 
                                alt={food.title} 
                                className="h-44 w-full object-cover"
                              />
                            )}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                              {vegTag && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                                  vegTag === 'Veg' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                  {vegTag}
                                </span>
                              )}
                              <PremiumBadge status={food.status} />
                            </div>
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-snug line-clamp-1">
                                  {food.title}
                                </h3>
                              </div>
                              <span className="inline-block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mt-1">
                                {food.category}
                              </span>
                              
                              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-3 leading-relaxed line-clamp-2">
                                {cleanDesc}
                              </p>
                              
                              <div className="space-y-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span>Quantity: <strong className="text-zinc-800 dark:text-zinc-200">{food.quantity} {food.unit}</strong></span>
                                </div>
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span className="truncate" title={food.pickupLocation}>{food.pickupLocation}</span>
                                </div>
                                {pickupTime && (
                                  <div className="flex items-center text-xs text-zinc-500 gap-2">
                                    <Clock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>Pickup: {pickupTime}</span>
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-zinc-500 gap-2">
                                  <CalendarDays className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span>Expires: {new Date(food.expiryTime).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                              <button
                                onClick={() => handleEditView(food)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(food._id)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Food Table View Layout */
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-400 dark:text-zinc-500 uppercase font-semibold">
                          <tr>
                            <th className="p-4">Food Item</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Veg / Non-Veg</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Pickup Address</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {filteredFoods.map(food => {
                            const vegTag = getVegBadge(food.description);
                            return (
                              <tr key={food._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                                <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">
                                  {food.title}
                                </td>
                                <td className="p-4 text-xs text-zinc-500">{food.category}</td>
                                <td className="p-4">
                                  {vegTag && (
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                      vegTag === 'Veg' 
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                    }`}>
                                      {vegTag}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-zinc-700 dark:text-zinc-300 font-semibold">{food.quantity} {food.unit}</td>
                                <td className="p-4 text-xs text-zinc-500 max-w-xs truncate">{food.pickupLocation}</td>
                                <td className="p-4">
                                    <PremiumBadge status={food.status} />
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditView(food)}
                                      className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(food._id)}
                                      className="p-1.5 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Add / Edit Form Panel */}
            {(activeTab === 'add-food' || activeTab === 'edit-food') && (
              <motion.div
                key="food-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Form Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/20">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="p-1.5 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      {editingFood ? 'Edit Food Listing' : 'Log New Food Surplus'}
                    </h2>
                  </div>
                  {editingFood && (
                    <PremiumBadge status={editingFood.status} />
                  )}
                </div>

                {/* Form inputs */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Food Name / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Leftover Vegetable Biryani"
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Veg / Non-Veg */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Veg / Non-Veg *
                      </label>
                      <div className="flex gap-4 items-center h-[38px]">
                        <label className="inline-flex items-center text-sm gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="vegNonVeg"
                            value="Veg"
                            checked={vegNonVeg === 'Veg'}
                            onChange={() => setVegNonVeg('Veg')}
                            className="text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>Veg</span>
                        </label>
                        <label className="inline-flex items-center text-sm gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="vegNonVeg"
                            value="Non-Veg"
                            checked={vegNonVeg === 'Non-Veg'}
                            onChange={() => setVegNonVeg('Non-Veg')}
                            className="text-red-500 focus:ring-red-500"
                          />
                          <span>Non-Veg</span>
                        </label>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Unit *
                      </label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        placeholder="e.g. servings, kg, boxes"
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none"
                      />
                    </div>

                    {/* Pickup Start */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Pickup Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={pickupStart}
                        onChange={e => setPickupStart(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Pickup End */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Pickup End Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={pickupEnd}
                        onChange={e => setPickupEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Expiry Time */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Expiry Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={expiryTime}
                        onChange={e => setExpiryTime(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Pickup Location Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Pickup Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-450">
                          <MapPin className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={pickupLocation}
                          onChange={e => setPickupLocation(e.target.value)}
                          placeholder="e.g. Student Center, Room 102"
                          className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Image Options */}
                    <div className="sm:col-span-2 space-y-4">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide leading-none">
                        Listing Image URL
                      </label>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center text-xs gap-2 cursor-pointer font-medium text-zinc-650 dark:text-zinc-350">
                          <input
                            type="radio"
                            name="imageOption"
                            value="select"
                            checked={imageOption === 'select'}
                            onChange={() => setImageOption('select')}
                            className="focus:ring-emerald-500 text-emerald-500"
                          />
                          <span>Use Category Stock Image</span>
                        </label>
                        <label className="inline-flex items-center text-xs gap-2 cursor-pointer font-medium text-zinc-650 dark:text-zinc-350">
                          <input
                            type="radio"
                            name="imageOption"
                            value="url"
                            checked={imageOption === 'url'}
                            onChange={() => setImageOption('url')}
                            className="focus:ring-emerald-500 text-emerald-500"
                          />
                          <span>Custom URL</span>
                        </label>
                      </div>

                      {imageOption === 'select' ? (
                        <div className="grid grid-cols-5 gap-3">
                          {Object.keys(stockImages).map(key => {
                            const isSelected = selectedStockImg === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedStockImg(key)}
                                className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                                  isSelected ? 'border-emerald-500 scale-105 shadow-md' : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={stockImages[key]} alt={key} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                                  <span className="text-[9px] font-bold text-white text-center leading-tight truncate">{key}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={e => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Edit status dropdown */}
                    {editingFood && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                          Surplus Status
                        </label>
                        <select
                          value={editingFood.status}
                          onChange={e => setEditingFood({ ...editingFood, status: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Collected">Collected</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                    )}

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Log instructions, allergen warnings, or food conditions..."
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('listings')}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {formSubmitting ? 'Saving...' : editingFood ? 'Save Changes' : 'Log Surplus'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Profile Page view */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Profile Header banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 relative flex items-end p-6">
                  <div className="absolute bottom-[-32px] left-6 h-20 w-20 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center font-extrabold text-3xl text-zinc-700 dark:text-zinc-300">
                    {user?.name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>

                <div className="pt-12 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</h2>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      {user?.role} Member
                    </span>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Email Address</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">{user?.email}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Member Since</span>
                      <span className="col-span-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-zinc-400 font-medium">Workspace Status</span>
                      <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Active Live System
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center">
                    <button
                      onClick={logout}
                      className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Sign Out Account
                    </button>
                    <p className="text-[11px] text-zinc-400">EcoShare V1.0.0 Foundation</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete Food Listing?</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete this listing? This action cannot be undone and the item will be removed from community boards.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) for Log Surplus */}
      <AnimatePresence>
        {(activeTab === 'overview' || activeTab === 'listings') && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingFood(null);
              setTitle('');
              setDescription('');
              setQuantity(1);
              setUnit('servings');
              setPickupLocation('');
              setActiveTab('add-food');
            }}
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-2 hover:shadow-emerald-500/25 transition-all cursor-pointer fab-animate"
            aria-label="Log Food Surplus"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-bold pr-1">Log Surplus</span>
          </motion.button>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
