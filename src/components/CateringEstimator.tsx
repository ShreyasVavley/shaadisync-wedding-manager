import React, { useState } from 'react';
import type { EventStats, EventDetails } from '../types/wedding';
import { Utensils, TrendingUp, AlertCircle, Sparkles, ChefHat, Leaf, Drumstick, Cake } from 'lucide-react';

interface CateringEstimatorProps {
  stats: EventStats;
  event: EventDetails;
  onUpdateCostPerPlate?: (cost: number) => void;
}

export const CateringEstimator: React.FC<CateringEstimatorProps> = ({
  stats,
  event,
  onUpdateCostPerPlate,
}) => {
  const [costPerPlate, setCostPerPlate] = useState<number>(event.costPerPlate || 2500);
  const [bufferPercent, setBufferPercent] = useState<number>(5); // 5% buffer is customary in Indian weddings

  const bufferGuests = Math.ceil((stats.confirmedGuests * bufferPercent) / 100);
  const totalRecommendedPlates = stats.confirmedGuests + bufferGuests;

  const blindTotalCost = stats.totalInvited * costPerPlate;
  const optimizedCateringCost = totalRecommendedPlates * costPerPlate;
  const netSavings = Math.max(0, blindTotalCost - optimizedCateringCost);

  // Raw food saved approximations based on standard Indian wedding catering ratios
  const paneerSavedKg = Math.round(stats.declinedGuests * 0.18);
  const meatSavedKg = Math.round(stats.declinedGuests * 0.22);
  const riceSavedKg = Math.round(stats.declinedGuests * 0.12);
  const sweetsSavedPieces = Math.round(stats.declinedGuests * 2.5);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCostChange = (newCost: number) => {
    setCostPerPlate(newCost);
    if (onUpdateCostPerPlate) {
      onUpdateCostPerPlate(newCost);
    }
  };

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
              <ChefHat className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                ROYAL BANQUET FINANCIAL ENGINE
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Catering &amp; Food Wastage Intelligence
              </h3>
              <p className="text-xs text-neutral-400">
                Prevent over-ordering at Taj Palace: exact kitchen commitments, zero dumped food.
              </p>
            </div>
          </div>
        </div>

        {/* Live Savings Highlight Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-black self-start sm:self-auto shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Realtime Host Savings: {formatINR(netSavings)}</span>
        </div>
      </div>

      {/* Plate Rate Controller */}
      <div className="bg-neutral-900/80 rounded-2xl p-5 border border-amber-500/20">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>₹</span>
            Catering Rate Per Plate (INR)
          </label>
          <span className="text-sm font-black font-mono text-amber-300 bg-neutral-950 px-3 py-1 rounded-xl border border-amber-500/30 shadow-inner">
            {formatINR(costPerPlate)} / plate
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="6000"
          step="100"
          value={costPerPlate}
          onChange={(e) => handleCostChange(Number(e.target.value))}
          className="w-full accent-amber-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-mono">
          <span>₹1,000 (Standard)</span>
          <span className="text-amber-400/80 font-semibold">₹2,500 (Taj Palace / Luxury Banquet)</span>
          <span>₹5,000+ (5-Star Destination)</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blind Guessing Card */}
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">
              Standard Blind Guess
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {formatINR(blindTotalCost)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Based on all {stats.totalInvited} invited guests
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-500/20 text-[11px] text-rose-300/90 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
            <span>High risk of 30-40% food dumped straight into trash</span>
          </div>
        </div>

        {/* Smart Confirmed Guarantee */}
        <div className="p-5 rounded-2xl border border-amber-500/40 bg-neutral-900/90 text-white relative shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 flex items-center justify-between">
              <span>Optimized Kitchen Order</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-bold">
                +{bufferPercent}% Buffer
              </span>
            </div>
            <div className="text-3xl font-black text-amber-300 font-mono">
              {formatINR(optimizedCateringCost)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {stats.confirmedGuests} Confirmed + {bufferGuests} Floating buffer
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span>Exact contract figure for banquet team</span>
          </div>
        </div>

        {/* Money Kept in Your Pocket */}
        <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 relative flex flex-col justify-between shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
              Net Host Savings
            </div>
            <div className="text-3xl font-black text-emerald-300 font-mono">
              {formatINR(netSavings)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Saved from unconfirmed / no-show plates
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5 font-bold">
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>Minimum guarantee locked before 48h cutoff!</span>
          </div>
        </div>
      </div>

      {/* Raw Ingredients Food Waste Prevention Metrics */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900/90 to-neutral-950/90 border border-amber-500/30 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>🍛</span>
            Raw Food Saved from Wastage ("Someone please eat the paneer!")
          </h4>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {stats.declinedGuests} No-shows Accounted For
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-neutral-950/70 rounded-xl border border-neutral-800 shadow-sm">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-400" /> Fresh Paneer
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ~{paneerSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Shahi &amp; Kadai Paneer</div>
          </div>

          <div className="p-3.5 bg-neutral-950/70 rounded-xl border border-neutral-800 shadow-sm">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Drumstick className="w-3 h-3 text-rose-400" /> Meat &amp; Chicken
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ~{meatSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Kebabs &amp; Biryanis</div>
          </div>

          <div className="p-3.5 bg-neutral-950/70 rounded-xl border border-neutral-800 shadow-sm">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <span>🌾</span> Basmati Rice
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ~{riceSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Pulao &amp; Dal Makhani</div>
          </div>

          <div className="p-3.5 bg-neutral-950/70 rounded-xl border border-neutral-800 shadow-sm">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Cake className="w-3 h-3 text-amber-400" /> Desserts &amp; Mithai
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ~{sweetsSavedPieces} pcs
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Gulab Jamun &amp; Jalebi</div>
          </div>
        </div>
      </div>

      {/* Dietary Split Breakdown */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-amber-400" />
          Confirmed Kitchen Prep Ratio
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-emerald-500/30 flex items-center gap-3">
            <span className="veg-badge" title="Vegetarian" />
            <div>
              <div className="text-xl font-black text-white font-mono">{stats.vegCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                Pure Veg ({stats.confirmedGuests > 0 ? Math.round((stats.vegCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-rose-500/30 flex items-center gap-3">
            <span className="non-veg-badge" title="Non-Vegetarian" />
            <div>
              <div className="text-xl font-black text-white font-mono">{stats.nonVegCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                Non-Veg ({stats.confirmedGuests > 0 ? Math.round((stats.nonVegCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-amber-500/30 flex items-center gap-3">
            <span className="jain-badge" title="Jain (No Root Veg)" />
            <div>
              <div className="text-xl font-black text-white font-mono">{stats.jainCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                Strict Jain ({stats.confirmedGuests > 0 ? Math.round((stats.jainCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Safety buffer selector */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
          <span>Floating relative cushion buffer:</span>
          <div className="flex gap-2">
            {[0, 5, 10, 15].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBufferPercent(b)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                  bufferPercent === b
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 border-amber-400 shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                +{b}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
