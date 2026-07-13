import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/ui/Toast.js';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldAlert, Award, MapPin, CheckCircle, Clock, 
  FileSpreadsheet, Plus, Edit, Trash2, Search, SlidersHorizontal, 
  List, Grid, ChevronRight, ArrowLeft, LogOut, LayoutDashboard,
  Utensils, CalendarDays, Compass
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

type TabView = 'overview' | 'listings' | 'add-food' | 'edit-food' | 'profile' | 'reservations' | 'users' | 'reports';

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
    } else {
      loadFoods();
    }
  }, [user]);

  // Student specific handlers
  const handleReserveFood = async (foodId: string) => {
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
    }
  };

  const handleCancelReservation = async (food: any) => {
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
    }
  };

  const handleCollectFood = async (food: any) => {
    try {
      const data = await collectFoodApi(food._id);
      if (data.success) {
        toast('success', 'Thank you! Surplus food marked as collected.');
        // Update local list
        setReservedFoods(prev => prev.map(item => item._id === food._id ? { ...item, status: 'Collected' } : item));
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to mark collection');
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

  // Status badges colors mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'Reserved':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'Collected':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-900/50';
      case 'Expired':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-850 dark:text-zinc-300';
    }
  };

  if (user?.role === 'Student') {
    const studentFilteredFoods = getFilteredAvailableFoods();
    const activeClaims = reservedFoods.filter(f => f.status === 'Reserved');
    const pastCollections = reservedFoods.filter(f => f.status === 'Collected');

    return (
      <div className="flex-grow bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        {/* Sub-Header Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <div className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'overview', label: 'Browse Food', icon: Utensils },
                  { id: 'reservations', label: 'My Reservations', icon: FileSpreadsheet },
                  { id: 'profile', label: 'My Profile', icon: User },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabView)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeClaims.length > 0 && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  <span className="text-xs font-bold text-amber-500 ml-2 hidden sm:inline">{activeClaims.length} Claim{activeClaims.length > 1 ? 's' : ''} Active</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                {/* Greeting Hero */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      Hello, {user?.name} 👋
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                      Claim excess meals from kitchens around campus to reduce food waste. Verify the pickup time slots and claim details below.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center min-w-[100px] shadow-sm">
                      <span className="block text-2xl font-black text-emerald-500">{studentFilteredFoods.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center min-w-[100px] shadow-sm">
                      <span className="block text-2xl font-black text-amber-500">{activeClaims.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reserved</span>
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
                          className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                Available
                              </span>
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
        </div>

        {/* Food Details Modal Overlay */}
        <AnimatePresence>
          {selectedFoodDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
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
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Confirm Claim Reservation
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (user?.role === 'NGO') {
    const ngoFilteredFoods = getFilteredAvailableFoods();
    const activeClaims = reservedFoods.filter(f => f.status === 'Reserved');
    const pastPickups = reservedFoods.filter(f => f.status === 'Collected');

    return (
      <div className="flex-grow bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        {/* Sub-Header Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <div className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'overview', label: 'Browse Donations', icon: Utensils },
                  { id: 'reservations', label: 'My Donations', icon: FileSpreadsheet },
                  { id: 'profile', label: 'NGO Profile', icon: User },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabView)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeClaims.length > 0 && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  <span className="text-xs font-bold text-emerald-500 ml-2 hidden sm:inline">{activeClaims.length} Claim{activeClaims.length > 1 ? 's' : ''} Claimed</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                {/* Greeting Hero */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      Hello, {user?.name} 🤝
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                      Claim bulk surplus food donations from restaurants and campus kitchens to redistribute to local food banks and community shelters.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center min-w-[100px] shadow-sm">
                      <span className="block text-2xl font-black text-emerald-500">{ngoFilteredFoods.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available Bulk</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center min-w-[100px] shadow-sm">
                      <span className="block text-2xl font-black text-amber-500">{activeClaims.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Claims Active</span>
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
                          className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                Available
                              </span>
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
        </div>

        {/* Food Details Modal Overlay */}
        <AnimatePresence>
          {selectedFoodDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
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
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Confirm Claim Donation
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      {/* Sub-Header Tabs (Linear inspired tabs style) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'listings', label: 'Food Listings', icon: Utensils },
                { id: 'profile', label: 'Kitchen Profile', icon: User },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id || (tab.id === 'listings' && (activeTab === 'add-food' || activeTab === 'edit-food'));
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabView)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAddView}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Food</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

                {/* Dashboard statistics cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Listings', value: totalListings, icon: FileSpreadsheet, color: 'text-zinc-500 bg-zinc-500/10' },
                    { label: 'Active Listings', value: activeListings, icon: Clock, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Reserved Listings', value: reservedListings, icon: Compass, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Completed Donations', value: completedDonations, icon: CheckCircle, color: 'text-sky-500 bg-sky-500/10' },
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={idx} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                          <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                          <StatIcon className="h-5 w-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Activity Grid */}
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
                            className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
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
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(food.status)}`}>
                                {food.status}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditView(food)}
                                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg cursor-pointer"
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

                  {/* Impact Panel Card */}
                  <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl mb-4">
                        <Award className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Redistribution Impact</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        Every logged listing coordinates excess food resources directly to charities. By logging leftovers, your kitchen helps offset methane emissions.
                      </p>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Volunteers Assisted</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">12 members</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Rescued Weight Equiv.</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">~{foods.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} kg</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                          className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                              <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(food.status)}`}>
                                {food.status}
                              </span>
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
                                  <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(food.status)}`}>
                                    {food.status}
                                  </span>
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
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(editingFood.status)}`}>
                      {editingFood.status}
                    </span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4"
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
