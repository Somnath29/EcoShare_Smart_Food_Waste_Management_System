import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Navigation, Layers, GitBranch, Hash,
  MapPin, Clock, Leaf, Users, Truck, Star,
  Zap, ChevronRight, RefreshCw, Target
} from 'lucide-react';

/* ─── Types ─── */
interface Recommendation {
  ngo: string;
  location: string;
  distance: number;
  travelTime: number;
  peopleServed: number;
  carbonSaved: number;
  vehicleUtil: number;
  confidence: number;
  freshness: number;
  expiryRisk: 'low' | 'medium' | 'high';
  priority: number;
  algorithm: 'greedy' | 'dijkstra' | 'hashmap' | 'priority_queue';
  pickupSequence: string[];
  why: string;
}

/* ─── Demo data generator ─── */
const generateRecommendations = (): Recommendation[] => [
  {
    ngo: 'Hope Food Bank',
    location: 'Sector 14, 2.3 km',
    distance: 2.3,
    travelTime: 8,
    peopleServed: 68,
    carbonSaved: 12.4,
    vehicleUtil: 87,
    confidence: 97,
    freshness: 94,
    expiryRisk: 'low',
    priority: 9.4,
    algorithm: 'greedy',
    pickupSequence: ['Gordon Hall', 'Union Cafeteria', 'Hope Food Bank'],
    why: 'Highest value-to-distance ratio. Greedy knapsack selects this NGO as it maximises meals delivered per km driven.',
  },
  {
    ngo: 'City Shelter Kitchen',
    location: 'Zone B, 4.1 km',
    distance: 4.1,
    travelTime: 14,
    peopleServed: 45,
    carbonSaved: 8.7,
    vehicleUtil: 72,
    confidence: 89,
    freshness: 81,
    expiryRisk: 'medium',
    priority: 7.8,
    algorithm: 'dijkstra',
    pickupSequence: ['Central Dining', 'City Shelter Kitchen'],
    why: "Dijkstra's algorithm computes the shortest weighted path on the campus road graph, making this the 2nd-fastest route.",
  },
  {
    ngo: 'Rainbow Community Centre',
    location: 'Sector 7, 5.8 km',
    distance: 5.8,
    travelTime: 19,
    peopleServed: 32,
    carbonSaved: 5.2,
    vehicleUtil: 61,
    confidence: 74,
    freshness: 68,
    expiryRisk: 'high',
    priority: 5.6,
    algorithm: 'priority_queue',
    pickupSequence: ['Sports Canteen', 'Rainbow Community Centre'],
    why: 'Priority queue ranks this 3rd — high expiry risk elevates urgency despite longer distance.',
  },
];

const ALGO_INFO = {
  greedy: {
    name: 'Greedy Knapsack',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Layers,
    time: 'O(n log n)',
    space: 'O(1)',
    desc: 'Sorts NGOs by meals/km ratio and greedily selects the best until vehicle capacity is reached.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    icon: Navigation,
    time: 'O((V+E) log V)',
    space: 'O(V)',
    desc: 'Computes shortest weighted path on campus road graph. Guarantees optimal route for every delivery.',
  },
  hashmap: {
    name: 'Hash Map Lookup',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: Hash,
    time: 'O(1) avg',
    space: 'O(n)',
    desc: 'Indexes NGO requirements by food category for instant O(1) matching without linear scans.',
  },
  priority_queue: {
    name: 'Min-Heap Priority Queue',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    icon: GitBranch,
    time: 'O(log n)',
    space: 'O(n)',
    desc: 'Maintains a heap ordered by food expiry time, always surfacing the most urgent item at root.',
  },
};

const RISK_STYLES = {
  low:    { label: 'Low Risk',    cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium Risk', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  high:   { label: 'High Risk',   cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' },
};

/* ─── Metric chip ─── */
const Metric: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  colorClass?: string;
}> = ({ icon: Icon, label, value, sub, colorClass = 'text-zinc-700 dark:text-zinc-200' }) => (
  <div className="flex flex-col gap-0.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
      <Icon className="h-3 w-3" />
      {label}
    </div>
    <span className={`text-base font-black font-mono ${colorClass}`}>{value}</span>
    {sub && <span className="text-[10px] text-zinc-400">{sub}</span>}
  </div>
);

/* ─── Confidence ring ─── */
const ConfidenceRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 28; const sw = 5;
  const nr = r - sw * 2;
  const circ = nr * 2 * Math.PI;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <svg className="h-full w-full -rotate-90">
        <circle cx={r} cy={r} r={nr} strokeWidth={sw} stroke="currentColor" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
        <motion.circle
          cx={r} cy={r} r={nr} strokeWidth={sw}
          strokeDasharray={`${circ} ${circ}`}
          strokeLinecap="round" fill="transparent"
          className="text-emerald-500"
          stroke="currentColor"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-zinc-900 dark:text-zinc-50">
        {pct}%
      </div>
    </div>
  );
};

/* ─── Recommendation Card ─── */
const RecoCard: React.FC<{
  reco: Recommendation;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}> = ({ reco, rank, selected, onSelect }) => {
  const risk = RISK_STYLES[reco.expiryRisk];
  const algo = ALGO_INFO[reco.algorithm];
  const AlgoIcon = algo.icon;

  return (
    <motion.button
      layout
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-lg shadow-emerald-500/10'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
          rank === 1 ? 'bg-amber-500 text-white' :
          rank === 2 ? 'bg-zinc-400 text-white' :
          'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
        }`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{reco.ngo}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${risk.cls}`}>
              {risk.label}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-zinc-400">
            <MapPin className="h-3 w-3" />
            {reco.location}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-black font-mono ${algo.color}`}>
            Priority {reco.priority}
          </span>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${algo.bg} ${algo.color}`}>
            <AlgoIcon className="h-2.5 w-2.5" />
            {algo.name.split(' ')[0]}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

/* ─── Main Component ─── */
export const AIDecisionCenter: React.FC = () => {
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setRecos(generateRecommendations());
      setLoading(false);
    }, 800);
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRecos(generateRecommendations());
      setRefreshing(false);
      setSelected(0);
    }, 600);
  };

  useEffect(() => { load(); }, []);

  const reco = recos[selected];
  const algo = reco ? ALGO_INFO[reco.algorithm] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            AI Decision Center
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Intelligent NGO matching engine — powered by Greedy, Dijkstra & Priority Queue algorithms.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Recompute
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: recommendation list */}
          <div className="xl:col-span-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              Ranked Recommendations
            </div>
            {recos.map((r, i) => (
              <RecoCard
                key={r.ngo}
                reco={r}
                rank={i + 1}
                selected={selected === i}
                onSelect={() => setSelected(i)}
              />
            ))}
          </div>

          {/* Right: detailed view */}
          <div className="xl:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              {reco && algo && (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* NGO header */}
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex items-start gap-4">
                      <ConfidenceRing pct={reco.confidence} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{reco.ngo}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${RISK_STYLES[reco.expiryRisk].cls}`}>
                            {RISK_STYLES[reco.expiryRisk].label}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {reco.why}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Metric icon={MapPin} label="Distance" value={`${reco.distance} km`} />
                    <Metric icon={Clock} label="Travel Time" value={`${reco.travelTime} min`} />
                    <Metric icon={Users} label="People Fed" value={`${reco.peopleServed}`} sub="estimated meals" colorClass="text-emerald-600 dark:text-emerald-400" />
                    <Metric icon={Leaf} label="CO₂ Saved" value={`${reco.carbonSaved} kg`} colorClass="text-teal-600 dark:text-teal-400" />
                    <Metric icon={Truck} label="Vehicle Util." value={`${reco.vehicleUtil}%`} />
                    <Metric icon={Star} label="Freshness" value={`${reco.freshness}%`} colorClass={reco.freshness > 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
                  </div>

                  {/* Priority score bar */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Food Priority Score</span>
                      <span className="font-black text-lg text-zinc-900 dark:text-zinc-50 font-mono">{reco.priority}/10</span>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(reco.priority / 10) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Algorithm explanation */}
                  <div className={`p-4 rounded-2xl border ${algo.border} ${algo.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${algo.bg}`}>
                        <algo.icon className={`h-4 w-4 ${algo.color}`} />
                      </div>
                      <span className={`text-sm font-bold ${algo.color}`}>{algo.name}</span>
                      <span className={`ml-auto font-mono text-xs font-bold px-2 py-0.5 rounded-md ${algo.bg} ${algo.color}`}>
                        Time: {algo.time}
                      </span>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${algo.bg} ${algo.color}`}>
                        Space: {algo.space}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{algo.desc}</p>
                  </div>

                  {/* Pickup sequence */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Suggested Pickup Sequence</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {reco.pickupSequence.map((loc, i) => (
                        <React.Fragment key={i}>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            i === 0 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                            i === reco.pickupSequence.length - 1 ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                            'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {i === 0 ? <Zap className="h-3 w-3" /> :
                             i === reco.pickupSequence.length - 1 ? <Target className="h-3 w-3" /> :
                             <MapPin className="h-3 w-3" />}
                            {loc}
                          </div>
                          {i < reco.pickupSequence.length - 1 && (
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Algorithm overview strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ALGO_INFO).map(([key, info]) => {
          const Icon = info.icon;
          return (
            <div key={key} className={`p-3 rounded-xl border ${info.border} ${info.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${info.color}`} />
                <span className={`text-xs font-bold ${info.color}`}>{info.name.split(' ')[0]}</span>
              </div>
              <div className={`font-mono text-[10px] font-bold ${info.color}`}>{info.time}</div>
              <div className="text-[9px] text-zinc-400 mt-0.5 line-clamp-2">{info.desc.substring(0, 60)}…</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
