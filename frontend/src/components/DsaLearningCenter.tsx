import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Layers, GitBranch, Navigation, BarChart3, Search,
  BookOpen, Zap, Clock, Box, Hash
} from 'lucide-react';

/* ─── Types ─── */
interface AlgoConfig {
  id: string;
  name: string;
  tag: string;
  icon: React.FC<{ className?: string }>;
  timeComplexity: string;
  spaceComplexity: string;
  color: string;
  bgColor: string;
  borderColor: string;
  realWorldDesc: string;
  ecoShareContext: string;
}

/* ─── Algorithm metadata ─── */
const ALGOS: AlgoConfig[] = [
  {
    id: 'hashmap',
    name: 'Hash Map',
    tag: 'O(1) Lookup',
    icon: Hash,
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(n)',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    realWorldDesc: 'Stores key→value pairs in a table using a hash function for near-instant lookups.',
    ecoShareContext: 'Maps food category → listing bucket; resolves kitchen ID → food items in O(1).',
  },
  {
    id: 'minheap',
    name: 'Min Heap',
    tag: 'Priority Queue',
    icon: GitBranch,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    realWorldDesc: 'A complete binary tree where every parent is ≤ its children. Root = minimum element.',
    ecoShareContext: 'Surfaces food items closest to expiry first, ensuring urgent items are claimed before spoiling.',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's",
    tag: 'Shortest Path',
    icon: Navigation,
    timeComplexity: 'O((V+E) log V)',
    spaceComplexity: 'O(V)',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    realWorldDesc: 'Finds the shortest path from a source node to all other nodes in a weighted graph.',
    ecoShareContext: 'Routes volunteers from campus kitchens to the nearest NGO shelter, minimising travel time and carbon.',
  },
  {
    id: 'greedy',
    name: 'Greedy Knapsack',
    tag: 'Optimisation',
    icon: Layers,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    realWorldDesc: 'Sorts items by value/weight ratio, greedily selecting the best until capacity is full.',
    ecoShareContext: 'Packs maximum food value into each volunteer delivery vehicle within its weight/volume limit.',
  },
  {
    id: 'binarysearch',
    name: 'Binary Search',
    tag: 'O(log n) Search',
    icon: Search,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    realWorldDesc: 'Halves the search space each step by comparing the target with the middle element.',
    ecoShareContext: 'Searches the sorted food catalog by expiry date or priority score in sub-linear time.',
  },
  {
    id: 'mergesort',
    name: 'Merge Sort',
    tag: 'Stable Sort',
    icon: BarChart3,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    realWorldDesc: 'Divide-and-conquer: split array in half, recursively sort each half, merge.',
    ecoShareContext: 'Produces chronologically sorted waste analytics timelines for admin reports.',
  },
];

/* ══════════════════════════════════════
   Hash Map Visualizer
══════════════════════════════════════ */
const HashMapViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ playing: _playing, step }) => {
  const entries = [
    { key: 'Cooked Meals', value: ['Rice Curry', 'Dal Fry', 'Biryani'], hash: 3 },
    { key: 'Baked Goods', value: ['Croissants', 'Muffins'], hash: 6 },
    { key: 'Raw Ingredients', value: ['Tomatoes', 'Onions'], hash: 1 },
    { key: 'Groceries', value: ['Milk', 'Eggs'], hash: 5 },
    { key: 'Others', value: ['Juice', 'Snacks'], hash: 2 },
  ];
  const buckets = Array.from({ length: 8 }, (_, i) => {
    const entry = entries.find(e => e.hash === i);
    return { index: i, entry };
  });
  const activeIdx = step % entries.length;
  const activeHash = entries[activeIdx]?.hash;

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
        <span className="text-emerald-500">hash</span>(<span className="text-amber-500">key</span>) → bucket index
      </div>
      {/* Input */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Inserting</span>
        <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
          "{entries[activeIdx]?.key}"
        </span>
        <span className="text-zinc-400">→</span>
        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
          bucket[{activeHash}]
        </span>
      </div>
      {/* Buckets */}
      <div className="grid grid-cols-4 gap-2">
        {buckets.map(b => (
          <motion.div
            key={b.index}
            animate={{
              scale: b.index === activeHash ? 1.04 : 1,
              borderColor: b.index === activeHash ? '#10b981' : undefined,
            }}
            className={`rounded-xl border p-2 text-center text-xs ${
              b.index === activeHash
                ? 'border-emerald-500 bg-emerald-500/10'
                : b.entry
                ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                : 'border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30'
            }`}
          >
            <div className="font-mono text-[9px] text-zinc-400 mb-1">idx[{b.index}]</div>
            {b.entry ? (
              <div className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300 truncate">
                {b.entry.key.split(' ')[0]}
              </div>
            ) : (
              <div className="text-zinc-300 dark:text-zinc-600 text-[10px]">empty</div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ <span className="text-emerald-500">table[hash(key)] = value</span></div>
        <div>→ Collision handled by chaining</div>
        <div>→ Load factor α = {entries.length}/8 = {(entries.length / 8).toFixed(2)}</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Min Heap Visualizer
══════════════════════════════════════ */
const MinHeapViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ step }) => {
  const allItems = [
    { val: 2, label: '2h', desc: 'Surplus Rice', urgent: true },
    { val: 5, label: '5h', desc: 'Baked Goods', urgent: true },
    { val: 8, label: '8h', desc: 'Raw Veggies', urgent: false },
    { val: 12, label: '12h', desc: 'Groceries', urgent: false },
    { val: 15, label: '15h', desc: 'Packaged', urgent: false },
    { val: 20, label: '20h', desc: 'Canned Items', urgent: false },
    { val: 24, label: '24h', desc: 'Dry Goods', urgent: false },
  ];
  const visibleCount = Math.min(3 + step, allItems.length);
  const heap = allItems.slice(0, visibleCount);
  const highlighted = step % visibleCount;

  // Tree layout: index 0 = root, left child = 2i+1, right child = 2i+2
  const positions = [
    { x: 50, y: 12 },
    { x: 25, y: 38 },
    { x: 75, y: 38 },
    { x: 12, y: 64 },
    { x: 38, y: 64 },
    { x: 62, y: 64 },
    { x: 88, y: 64 },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
        Root = <span className="text-rose-500 font-bold">min expiry time</span> — always the most urgent item
      </div>
      {/* SVG Tree */}
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 100 80" className="w-full h-full">
          {/* Edges */}
          {heap.map((_, i) => {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            return (
              <g key={i}>
                {left < heap.length && positions[i] && positions[left] && (
                  <line
                    x1={positions[i].x} y1={positions[i].y + 5}
                    x2={positions[left].x} y2={positions[left].y - 5}
                    stroke="#d4d4d8" strokeWidth="0.5"
                  />
                )}
                {right < heap.length && positions[i] && positions[right] && (
                  <line
                    x1={positions[i].x} y1={positions[i].y + 5}
                    x2={positions[right].x} y2={positions[right].y - 5}
                    stroke="#d4d4d8" strokeWidth="0.5"
                  />
                )}
              </g>
            );
          })}
          {/* Nodes */}
          {heap.map((item, i) => {
            const pos = positions[i];
            if (!pos) return null;
            const isRoot = i === 0;
            const isHighlighted = i === highlighted;
            return (
              <g key={i}>
                <circle
                  cx={pos.x} cy={pos.y} r="6"
                  fill={isRoot ? '#f43f5e' : isHighlighted ? '#10b981' : '#e4e4e7'}
                  opacity={0.9}
                />
                <text
                  x={pos.x} y={pos.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="3.5" fontWeight="bold"
                  fill={isRoot || isHighlighted ? '#fff' : '#52525b'}
                >
                  {item.val}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Array view */}
      <div className="flex gap-1 flex-wrap">
        {heap.map((item, i) => (
          <div key={i} className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-center ${
            i === 0 ? 'border-rose-500 bg-rose-500/10' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50'
          }`}>
            <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{item.label}</span>
            <span className="text-[8px] text-zinc-400 truncate max-w-[52px]">{item.desc}</span>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ <span className="text-rose-500">heap[0]</span> = most urgent food item</div>
        <div>→ heapify after insert/extract: <span className="text-amber-500">O(log n)</span></div>
        <div>→ {heap.length} items in queue, {allItems.length - heap.length} pending</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Dijkstra Visualizer
══════════════════════════════════════ */
const DijkstraViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ step }) => {
  const nodes = [
    { id: 'K', label: 'Kitchen', x: 10, y: 45, color: '#10b981' },
    { id: 'A', label: 'Node A', x: 35, y: 20, color: '#6366f1' },
    { id: 'B', label: 'Node B', x: 35, y: 70, color: '#6366f1' },
    { id: 'C', label: 'Node C', x: 62, y: 35, color: '#6366f1' },
    { id: 'D', label: 'Node D', x: 62, y: 65, color: '#6366f1' },
    { id: 'N', label: 'NGO', x: 88, y: 50, color: '#f59e0b' },
  ];
  const edges = [
    { from: 0, to: 1, w: 4 }, { from: 0, to: 2, w: 7 },
    { from: 1, to: 3, w: 5 }, { from: 2, to: 3, w: 3 }, { from: 2, to: 4, w: 6 },
    { from: 3, to: 5, w: 2 }, { from: 4, to: 5, w: 4 },
  ];
  // Dijkstra path: K→A→C→NGO = 4+5+2 = 11
  const pathSteps = [
    { visited: ['K'], current: 'K', dist: { K: 0, A: 4, B: 7, C: '∞', D: '∞', N: '∞' } },
    { visited: ['K', 'A'], current: 'A', dist: { K: 0, A: 4, B: 7, C: 9, D: '∞', N: '∞' } },
    { visited: ['K', 'A', 'C'], current: 'C', dist: { K: 0, A: 4, B: 7, C: 9, D: '∞', N: 11 } },
    { visited: ['K', 'A', 'C', 'N'], current: 'N', dist: { K: 0, A: 4, B: 7, C: 9, D: '∞', N: 11 } },
  ];
  const s = Math.min(step, pathSteps.length - 1);
  const state = pathSteps[s];
  const shortestPath = ['K', 'A', 'C', 'N'];
  const pathEdges = [{ from: 0, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 5 }];

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
        Finding shortest path from <span className="text-emerald-500 font-bold">Kitchen</span> to{' '}
        <span className="text-amber-500 font-bold">NGO Shelter</span>
      </div>
      {/* Graph */}
      <div className="relative h-36 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <svg viewBox="0 0 100 90" className="w-full h-full">
          {/* Regular edges */}
          {edges.map((e, i) => {
            const from = nodes[e.from];
            const to = nodes[e.to];
            const isPath = pathEdges.some(p => {
              const stepNum = pathEdges.indexOf(p);
              return p.from === e.from && p.to === e.to && stepNum < s;
            });
            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isPath ? '#10b981' : '#d4d4d8'}
                  strokeWidth={isPath ? 1.5 : 0.6}
                  strokeOpacity={0.8}
                />
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.5}
                  textAnchor="middle" fontSize="2.8" fill="#a1a1aa"
                >
                  {e.w}km
                </text>
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map((n, i) => {
            const isVisited = state.visited.includes(n.id);
            const isCurrent = state.current === n.id;
            const isOnPath = shortestPath.slice(0, s + 1).includes(n.id);
            return (
              <g key={i}>
                <circle
                  cx={n.x} cy={n.y} r="6"
                  fill={isCurrent ? n.color : isOnPath ? `${n.color}80` : isVisited ? '#a1a1aa' : '#e4e4e7'}
                />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="2.8" fontWeight="bold" fill={isCurrent || isOnPath ? '#fff' : '#52525b'}>
                  {n.id}
                </text>
                <text x={n.x} y={n.y + 9} textAnchor="middle" fontSize="2.5" fill="#71717a">
                  {(state.dist as Record<string, string | number>)[n.id] ?? '∞'}km
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ Step {s + 1}/{pathSteps.length}: visiting <span className="text-indigo-500">{state.current}</span></div>
        <div>→ Visited: {state.visited.join(' → ')}</div>
        {s === pathSteps.length - 1 && (
          <div>→ <span className="text-emerald-500">Shortest: K→A→C→NGO = 11 km</span></div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Greedy Knapsack Visualizer
══════════════════════════════════════ */
const GreedyViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ step }) => {
  const items = [
    { name: 'Biryani', weight: 5, value: 50, ratio: 10.0 },
    { name: 'Dal Fry', weight: 4, value: 36, ratio: 9.0 },
    { name: 'Paneer', weight: 3, value: 24, ratio: 8.0 },
    { name: 'Bread', weight: 6, value: 42, ratio: 7.0 },
    { name: 'Juice', weight: 8, value: 40, ratio: 5.0 },
  ];
  const capacity = 15;
  const sortedItems = [...items].sort((a, b) => b.ratio - a.ratio);
  
  // Build knapsack state step by step
  let cumWeight = 0;
  const knapsack: { name: string; taken: number; weight: number; value: number }[] = [];
  for (const item of sortedItems) {
    if (cumWeight + item.weight <= capacity) {
      knapsack.push({ name: item.name, taken: 1, weight: item.weight, value: item.value });
      cumWeight += item.weight;
    } else {
      const frac = (capacity - cumWeight) / item.weight;
      if (frac > 0) {
        knapsack.push({ name: item.name, taken: frac, weight: item.weight * frac, value: item.value * frac });
        cumWeight = capacity;
      }
    }
  }

  const visibleItems = Math.min(step + 1, knapsack.length);
  const filledWeight = knapsack.slice(0, visibleItems).reduce((s, i) => s + i.weight, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          Capacity: <span className="text-amber-500 font-bold">{capacity} kg</span>
        </span>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          Filled: <span className="text-emerald-500 font-bold">{filledWeight.toFixed(1)} kg</span>
        </span>
      </div>
      {/* Capacity bar */}
      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          animate={{ width: `${(filledWeight / capacity) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {/* Items (sorted by ratio) */}
      <div className="space-y-1.5">
        {sortedItems.map((item, i) => {
          const kItem = knapsack[i];
          const isActive = i < visibleItems;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
              className={`flex items-center gap-3 p-2 rounded-lg border text-xs ${
                isActive ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-500 text-white text-[8px] font-bold shrink-0">
                {i + 1}
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 min-w-[64px]">{item.name}</span>
              <span className="text-zinc-400 font-mono">{item.weight}kg</span>
              <span className="text-zinc-400 font-mono">${item.value}</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">ratio {item.ratio}</span>
              {isActive && kItem && (
                <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  {kItem.taken === 1 ? '✓ Full' : `✓ ${(kItem.taken * 100).toFixed(0)}%`}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ Sort by value/weight ratio (greedy choice)</div>
        <div>→ Take fractional portion when full item doesn't fit</div>
        <div>→ Max value packed: <span className="text-amber-500">${knapsack.slice(0, visibleItems).reduce((s, i) => s + i.value, 0).toFixed(0)}</span></div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Binary Search Visualizer
══════════════════════════════════════ */
const BinarySearchViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ step }) => {
  const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = 23;
  const steps = [
    { lo: 0, hi: 9, mid: 4, found: false, cmp: `arr[4]=16 < ${target}` },
    { lo: 5, hi: 9, mid: 7, found: false, cmp: `arr[7]=56 > ${target}` },
    { lo: 5, hi: 6, mid: 5, found: true,  cmp: `arr[5]=23 = ${target} ✓` },
  ];
  const s = Math.min(step, steps.length - 1);
  const state = steps[s];

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
        Target: <span className="text-sky-500 font-bold">{target}</span>{' '}
        (sorted food priority scores)
      </div>
      {/* Array */}
      <div className="flex gap-1 flex-wrap">
        {arr.map((val, i) => {
          const isLo = i === state.lo;
          const isHi = i === state.hi;
          const isMid = i === state.mid;
          const inRange = i >= state.lo && i <= state.hi;
          const isFound = state.found && isMid;
          return (
            <motion.div
              key={i}
              animate={{ scale: isMid ? 1.12 : 1 }}
              className={`flex flex-col items-center w-9 py-1.5 rounded-lg border text-center text-xs font-mono font-bold ${
                isFound ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                isMid ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300' :
                inRange ? 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800' :
                'border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-800/30'
              }`}
            >
              {val}
              <span className="text-[8px] font-normal text-zinc-400 mt-0.5">
                {isLo && !isHi ? 'lo' : isHi && !isLo ? 'hi' : isMid ? 'mid' : i}
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ Step {s + 1}/{steps.length}: {state.cmp}</div>
        <div>→ Search space: [{state.lo}..{state.hi}] ({state.hi - state.lo + 1} elements)</div>
        {state.found && <div>→ <span className="text-emerald-500">Found {target} at index {state.mid}!</span></div>}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Merge Sort Visualizer
══════════════════════════════════════ */
const MergeSortViz: React.FC<{ playing: boolean; step: number; maxSteps: number }> = ({ step }) => {
  const stages = [
    { label: 'Original', arrays: [[38, 27, 43, 3, 9, 82, 10]], merging: [] as number[][] },
    { label: 'Split 1', arrays: [[38, 27, 43, 3], [9, 82, 10]], merging: [] as number[][] },
    { label: 'Split 2', arrays: [[38, 27], [43, 3], [9, 82], [10]], merging: [] as number[][] },
    { label: 'Split 3', arrays: [[38], [27], [43], [3], [9], [82], [10]], merging: [] as number[][] },
    { label: 'Merge 1', arrays: [[27, 38], [3, 43], [9, 82], [10]], merging: [[27, 38], [3, 43]] },
    { label: 'Merge 2', arrays: [[3, 27, 38, 43], [9, 10, 82]], merging: [[3, 27, 38, 43]] },
    { label: 'Sorted ✓', arrays: [[3, 9, 10, 27, 38, 43, 82]], merging: [[3, 9, 10, 27, 38, 43, 82]] },
  ];
  const s = Math.min(step, stages.length - 1);
  const stage = stages[s];
  const isFinal = s === stages.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Stage:</span>
        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{stage.label}</span>
      </div>
      <div className="space-y-2">
        {stage.arrays.map((arr, ai) => {
          const isMerging = stage.merging.some(m => JSON.stringify(m) === JSON.stringify(arr));
          return (
            <div key={ai} className="flex gap-1 flex-wrap">
              {arr.map((val, vi) => (
                <motion.div
                  key={vi}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: vi * 0.03 }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-mono font-bold ${
                    isFinal ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                    isMerging ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300' :
                    'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
        <div>→ Depth: {Math.ceil(Math.log2(7))} levels = O(log n) splits</div>
        <div>→ Merge work per level: O(n)</div>
        <div>→ Total: <span className="text-purple-500">O(n log n)</span> guaranteed</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Main DSA Learning Center
══════════════════════════════════════ */
const VIZ_STEPS: Record<string, number> = {
  hashmap: 5, minheap: 4, dijkstra: 4, greedy: 5, binarysearch: 3, mergesort: 7,
};

export const DsaLearningCenter: React.FC = () => {
  const [activeAlgo, setActiveAlgo] = useState('hashmap');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const algo = ALGOS.find(a => a.id === activeAlgo)!;
  const maxSteps = VIZ_STEPS[activeAlgo] ?? 4;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= maxSteps - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 1200);
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [playing, maxSteps, stopInterval]);

  const reset = () => {
    setPlaying(false);
    setStep(0);
  };

  const handleAlgoChange = (id: string) => {
    setActiveAlgo(id);
    reset();
  };

  const renderViz = () => {
    const props = { playing, step, maxSteps };
    switch (activeAlgo) {
      case 'hashmap':     return <HashMapViz {...props} />;
      case 'minheap':     return <MinHeapViz {...props} />;
      case 'dijkstra':    return <DijkstraViz {...props} />;
      case 'greedy':      return <GreedyViz {...props} />;
      case 'binarysearch':return <BinarySearchViz {...props} />;
      case 'mergesort':   return <MergeSortViz {...props} />;
      default:            return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-500" />
            DSA Learning Center
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Interactive algorithm visualisations powering EcoShare's food redistribution engine.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <Zap className="h-3.5 w-3.5" />
          {ALGOS.length} algorithms · Live visualiser
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Algo selector */}
        <div className="xl:col-span-4 space-y-2">
          {ALGOS.map(a => {
            const Icon = a.icon;
            const isActive = activeAlgo === a.id;
            return (
              <button
                key={a.id}
                onClick={() => handleAlgoChange(a.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? `${a.borderColor} ${a.bgColor}`
                    : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isActive ? a.bgColor : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                  <Icon className={`h-4 w-4 ${isActive ? a.color : 'text-zinc-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {a.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? a.bgColor + ' ' + a.color : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      {a.timeComplexity}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{a.tag}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visualizer panel */}
        <div className="xl:col-span-8 space-y-4">
          {/* Complexity banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${algo.borderColor} ${algo.bgColor} flex items-center gap-2`}>
              <Clock className={`h-4 w-4 shrink-0 ${algo.color}`} />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Time</div>
                <div className={`font-mono font-black text-sm ${algo.color}`}>{algo.timeComplexity}</div>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${algo.borderColor} ${algo.bgColor} flex items-center gap-2`}>
              <Box className={`h-4 w-4 shrink-0 ${algo.color}`} />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Space</div>
                <div className={`font-mono font-black text-sm ${algo.color}`}>{algo.spaceComplexity}</div>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">EcoShare Use Case</div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{algo.ecoShareContext}</p>
          </div>

          {/* Visualizer */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${algo.color}`}>
                  {algo.name} Visualiser
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  step {step + 1}/{maxSteps}
                </span>
              </div>
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </button>
                <button
                  onClick={() => setPlaying(p => !p)}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    playing ? 'border-rose-500 bg-rose-500/10 text-rose-600' : `border-emerald-500 bg-emerald-500/10 ${algo.color}`
                  }`}
                >
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={reset}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </button>
                <button
                  onClick={() => setStep(s => Math.min(maxSteps - 1, s + 1))}
                  disabled={step >= maxSteps - 1}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${
                  algo.id === 'hashmap' ? 'from-emerald-500 to-teal-500' :
                  algo.id === 'minheap' ? 'from-rose-500 to-pink-500' :
                  algo.id === 'dijkstra' ? 'from-indigo-500 to-purple-500' :
                  algo.id === 'greedy' ? 'from-amber-500 to-orange-500' :
                  algo.id === 'binarysearch' ? 'from-sky-500 to-cyan-500' :
                  'from-purple-500 to-violet-500'
                }`}
                animate={{ width: `${((step + 1) / maxSteps) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAlgo + step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderViz()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Theory card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">How It Works</div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{algo.realWorldDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
