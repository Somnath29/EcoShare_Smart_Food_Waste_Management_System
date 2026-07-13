import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Treemap, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  BarChart3, Leaf, Users, Utensils,
  Building2, Download, Award,
  Flame, Globe, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';

/* ─── Colour palette ─── */
const COLORS = {
  emerald: '#10b981', teal: '#14b8a6', indigo: '#6366f1',
  purple: '#a855f7', amber: '#f59e0b', rose: '#f43f5e',
  sky: '#0ea5e9', violet: '#8b5cf6',
};

/* ─── Static demo data ─── */
const weeklyRescues = [
  { day: 'Mon', meals: 142, carbon: 5.2, ngos: 8 },
  { day: 'Tue', meals: 198, carbon: 7.1, ngos: 11 },
  { day: 'Wed', meals: 165, carbon: 5.9, ngos: 9 },
  { day: 'Thu', meals: 237, carbon: 8.5, ngos: 14 },
  { day: 'Fri', meals: 312, carbon: 11.2, ngos: 18 },
  { day: 'Sat', meals: 189, carbon: 6.8, ngos: 10 },
  { day: 'Sun', meals: 94,  carbon: 3.4, ngos: 5  },
];

const monthlyData = [
  { month: 'Jan', meals: 3200, waste: 820, carbon: 112 },
  { month: 'Feb', meals: 2900, waste: 740, carbon: 98  },
  { month: 'Mar', meals: 3800, waste: 620, carbon: 135 },
  { month: 'Apr', meals: 4200, waste: 540, carbon: 148 },
  { month: 'May', meals: 4900, waste: 480, carbon: 172 },
  { month: 'Jun', meals: 5600, waste: 390, carbon: 196 },
  { month: 'Jul', meals: 6200, waste: 310, carbon: 218 },
];

const categoryData = [
  { name: 'Cooked Meals', value: 38, fill: COLORS.emerald },
  { name: 'Baked Goods',  value: 22, fill: COLORS.indigo  },
  { name: 'Groceries',    value: 18, fill: COLORS.amber   },
  { name: 'Raw Ingred.',  value: 14, fill: COLORS.rose    },
  { name: 'Others',       value: 8,  fill: COLORS.sky     },
];

const ngoRadar = [
  { subject: 'Response Time', A: 90, B: 75, C: 60 },
  { subject: 'Capacity',      A: 85, B: 92, C: 70 },
  { subject: 'Reliability',   A: 95, B: 80, C: 85 },
  { subject: 'Coverage',      A: 70, B: 88, C: 92 },
  { subject: 'Carbon Eff.',   A: 88, B: 72, C: 78 },
];

const treemapData = [
  { name: 'Cooked Meals', size: 4800 }, { name: 'Baked Goods', size: 2800 },
  { name: 'Groceries', size: 2200 },    { name: 'Raw Ingred.', size: 1800 },
  { name: 'Packaged', size: 1200 },     { name: 'Beverages', size: 900 },
  { name: 'Snacks', size: 600 },        { name: 'Others', size: 400 },
];

// Calendar heatmap (4 weeks × 7 days)
const calendarData = Array.from({ length: 28 }, (_, i) => ({
  day: i, value: Math.floor(Math.random() * 100),
}));

const kitchenPerf = [
  { kitchen: 'Gordon Hall', rescued: 1820, wasted: 120, efficiency: 94 },
  { kitchen: 'Union Café',  rescued: 1540, wasted: 210, efficiency: 88 },
  { kitchen: 'Sports Hub',  rescued: 980,  wasted: 340, efficiency: 74 },
  { kitchen: 'Central',     rescued: 2200, wasted: 90,  efficiency: 96 },
  { kitchen: 'East Wing',   rescued: 760,  wasted: 280, efficiency: 73 },
];

/* ─── KPI Card ─── */
const KPICard: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  trend: number;
  sub: string;
  color: string;
  delay?: number;
}> = ({ icon: Icon, label, value, trend, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45 }}
    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
        {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {Math.abs(trend)}%
      </div>
    </div>
    <div className="mt-3">
      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{value}</div>
      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{label}</div>
      <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>
    </div>
  </motion.div>
);

/* ─── Section wrapper ─── */
const Section: React.FC<{ title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title, sub, action, children,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">{title}</h3>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

/* ─── Calendar Heatmap ─── */
const CalendarHeatmap: React.FC = () => {
  const weeks = Array.from({ length: 4 }, (_, w) =>
    calendarData.slice(w * 7, w * 7 + 7)
  );
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex gap-1 mb-2">
        {days.map((d, i) => (
          <div key={i} className="w-8 text-center text-[9px] text-zinc-400">{d}</div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((cell) => {
              const intensity = cell.value / 100;
              const alpha = Math.max(0.08, intensity);
              return (
                <motion.div
                  key={cell.day}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: cell.day * 0.01 }}
                  title={`${cell.value} meals`}
                  className="w-8 h-8 rounded-md cursor-default transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgba(16,185,129,${alpha})`, border: `1px solid rgba(16,185,129,${alpha * 0.4})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] text-zinc-400">Less</span>
        {[0.08, 0.25, 0.45, 0.65, 0.85].map((a, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(16,185,129,${a})` }} />
        ))}
        <span className="text-[9px] text-zinc-400">More</span>
      </div>
    </div>
  );
};

/* ─── Custom tooltip ─── */
const ChartTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <div className="font-bold text-zinc-700 dark:text-zinc-200 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500 dark:text-zinc-400">{p.name}:</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Export CSV ─── */
const exportCSV = () => {
  const rows = [
    ['Day', 'Meals Rescued', 'Carbon Saved (kg)', 'NGO Partners'],
    ...weeklyRescues.map(r => [r.day, r.meals, r.carbon, r.ngos]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ecoshare_analytics.csv'; a.click();
  URL.revokeObjectURL(url);
};

/* ─── Main Component ─── */
export const VisualAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  const totalMeals = useMemo(() => weeklyRescues.reduce((s, d) => s + d.meals, 0), []);
  const totalCarbon = useMemo(() => weeklyRescues.reduce((s, d) => s + d.carbon, 0).toFixed(1), []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            Analytics & Business Intelligence
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Real-time impact metrics, environmental analytics, and performance dashboards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {(['week', 'month', 'year'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  dateRange === r
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Utensils}   label="Meals Rescued"    value={totalMeals.toLocaleString()} trend={18}  sub="this week vs last" color="text-emerald-500" delay={0}    />
        <KPICard icon={Leaf}       label="CO₂ Saved (kg)"   value={String(totalCarbon)}          trend={22}  sub="methane diverted"  color="text-teal-500"   delay={0.06} />
        <KPICard icon={Building2}  label="Active NGOs"       value="24"                           trend={8}   sub="partner shelters"  color="text-indigo-500" delay={0.12} />
        <KPICard icon={Users}      label="People Fed"        value="3,840"                        trend={-4}  sub="estimated weekly"  color="text-amber-500"  delay={0.18} />
      </div>

      {/* Area chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section
          title="Weekly Rescue Trend"
          sub="Meals rescued & carbon saved per day"
          action={<Zap className="h-4 w-4 text-emerald-500" />}
        >
          <div className="col-span-1 lg:col-span-2" />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Weekly Rescue Trend</div>
              <div className="text-[11px] text-zinc-400">Meals rescued & carbon saved per day</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyRescues} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="meals" name="Meals" stroke={COLORS.emerald} fill="url(#mealGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="carbon" name="CO₂ kg" stroke={COLORS.indigo} fill="url(#carbonGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Category Breakdown</div>
          <div className="text-[11px] text-zinc-400 mb-4">Rescue by food type</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.fill }} />
                <span className="text-zinc-600 dark:text-zinc-400 flex-1">{c.name}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bars + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked bar — monthly */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Monthly Impact</div>
          <div className="text-[11px] text-zinc-400 mb-4">Meals rescued vs. food wasted</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="meals" name="Rescued" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="waste" name="Wasted" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar — NGO performance */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">NGO Performance Radar</div>
          <div className="text-[11px] text-zinc-400 mb-4">Multi-dimensional comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={ngoRadar} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
              <PolarGrid stroke="rgba(0,0,0,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#a1a1aa' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Hope Food Bank" dataKey="A" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.2} />
              <Radar name="City Shelter" dataKey="B" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.2} />
              <Radar name="Rainbow Ctr." dataKey="C" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Treemap */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Food Category Treemap</div>
        <div className="text-[11px] text-zinc-400 mb-4">Volume proportions by category (size = kg rescued)</div>
        <ResponsiveContainer width="100%" height={200}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            content={({ x, y, width, height, name, value }: any) => {
              if (!width || !height || width < 40 || height < 30) return <g />;
              const colors = [COLORS.emerald, COLORS.indigo, COLORS.amber, COLORS.rose, COLORS.sky, COLORS.teal, COLORS.violet, COLORS.purple];
              const idx = treemapData.findIndex(d => d.name === name);
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill={colors[idx % colors.length]} fillOpacity={0.8} rx={6} />
                  <text x={x + 8} y={y + 16} fill="#fff" fontSize={10} fontWeight="bold">{name}</text>
                  <text x={x + 8} y={y + 28} fill="rgba(255,255,255,0.7)" fontSize={9}>{value} kg</text>
                </g>
              );
            }}
          />
        </ResponsiveContainer>
      </div>

      {/* Calendar heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Daily Activity Heatmap</div>
          <div className="text-[11px] text-zinc-400">Last 4 weeks of rescue activity</div>
          <CalendarHeatmap />
        </div>

        {/* Kitchen performance table */}
        <div className="space-y-3">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Kitchen Performance</div>
          <div className="text-[11px] text-zinc-400">Rescue efficiency by dining hall</div>
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            {kitchenPerf.map((k, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{k.kitchen}</span>
                  <span className={`font-bold font-mono ${k.efficiency >= 90 ? 'text-emerald-600 dark:text-emerald-400' : k.efficiency >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {k.efficiency}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${k.efficiency >= 90 ? 'bg-emerald-500' : k.efficiency >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${k.efficiency}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </div>
                <div className="flex gap-3 text-[10px] text-zinc-400">
                  <span>{k.rescued.toLocaleString()} rescued</span>
                  <span>·</span>
                  <span>{k.wasted} wasted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environmental impact strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Leaf,   label: 'Methane Averted', value: '14.8 t',  sub: 'CO₂ equivalent', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
          { icon: Globe,  label: 'Carbon Footprint', value: '−31%',    sub: 'vs. last quarter', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { icon: Flame,  label: 'Landfill Diverted', value: '6.2 t',  sub: 'organic waste', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { icon: Award,  label: 'Sustainability Score', value: '94/100', sub: 'campus ranking #1', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-4 rounded-2xl border ${card.border} ${card.bg}`}
            >
              <Icon className={`h-5 w-5 ${card.color} mb-2`} />
              <div className={`text-xl font-black font-mono ${card.color}`}>{card.value}</div>
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">{card.label}</div>
              <div className="text-[10px] text-zinc-400">{card.sub}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
