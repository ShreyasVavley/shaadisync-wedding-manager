import React, { useState } from 'react';
import type { EventStats, EventDetails } from '../types/wedding';
import { DollarSign, Utensils, TrendingUp, AlertCircle, Sparkles, ChefHat, Leaf, Drumstick, Cake } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-900 text-white shadow-sm">
              <ChefHat className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Catering &amp; Food Wastage Intelligence
              </h3>
              <p className="text-xs text-neutral-500">
                Solve the Indian wedding dilemma: zero dumped food, exact kitchen commitments.
              </p>
            </div>
          </div>
        </div>

        {/* Live Savings Highlight Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold self-start sm:self-auto shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Realtime Savings: {formatINR(netSavings)}</span>
        </div>
      </div>

      {/* Plate Rate Controller */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/60">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Catering Rate Per Plate (INR)
          </label>
          <span className="text-sm font-extrabold text-neutral-900 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
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
          className="w-full accent-neutral-900 h-2 bg-neutral-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
          <span>₹1,000 (Standard)</span>
          <span>₹2,500 (Taj / Luxury Banquet)</span>
          <span>₹5,000+ (5-Star / Destination)</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blind Guessing Card */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 relative overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1">
            Standard Blind Guess
          </div>
          <div className="text-2xl font-black text-rose-950 font-mono">
            {formatINR(blindTotalCost)}
          </div>
          <div className="text-xs text-rose-700 mt-1">
            Based on all {stats.totalInvited} invited guests
          </div>
          <div className="mt-3 pt-3 border-t border-rose-200/60 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>High risk of 30-40% food dumped straight into trash</span>
          </div>
        </div>

        {/* Smart Confirmed Guarantee */}
        <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-900 text-white relative shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-between">
            <span>Optimized Guarantee</span>
            <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[9px]">
              +{bufferPercent}% Buffer
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatINR(optimizedCateringCost)}
          </div>
          <div className="text-xs text-neutral-300 mt-1">
            {stats.confirmedGuests} Confirmed + {bufferGuests} Floating buffer
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>Exact contract figure for banquet hall</span>
          </div>
        </div>

        {/* Money Kept in Your Pocket */}
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 relative">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">
            Net Host Savings
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono">
            {formatINR(netSavings)}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Saved from unconfirmed / no-show plates
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
            <span>Ready to negotiate minimum guarantee!</span>
          </div>
        </div>
      </div>

      {/* Raw Ingredients Food Waste Prevention Metrics */}
      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span>🍛</span>
            Raw Food Saved from Wastage ("Someone please eat the paneer!")
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
            {stats.declinedGuests} No-shows Prevented
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-600" /> Fresh Paneer
            </div>
            <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
              ~{paneerSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500">Shahi &amp; Kadai Paneer</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Drumstick className="w-3 h-3 text-rose-600" /> Meat &amp; Chicken
            </div>
            <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
              ~{meatSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500">Kebabs &amp; Biryanis</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <span>🌾</span> Basmati Rice
            </div>
            <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
              ~{riceSavedKg} kg
            </div>
            <div className="text-[10px] text-neutral-500">Pulao &amp; Dal Makhani</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Cake className="w-3 h-3 text-amber-600" /> Desserts &amp; Mithai
            </div>
            <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
              ~{sweetsSavedPieces} pcs
            </div>
            <div className="text-[10px] text-neutral-500">Gulab Jamun &amp; Jalebi</div>
          </div>
        </div>
      </div>

      {/* Dietary Split Breakdown */}
      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5" />
          Confirmed Kitchen Prep Ratio
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-3">
            <span className="veg-badge" title="Vegetarian" />
            <div>
              <div className="text-lg font-extrabold text-neutral-900">{stats.vegCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Pure Veg ({stats.confirmedGuests > 0 ? Math.round((stats.vegCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-3">
            <span className="non-veg-badge" title="Non-Vegetarian" />
            <div>
              <div className="text-lg font-extrabold text-neutral-900">{stats.nonVegCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Non-Veg ({stats.confirmedGuests > 0 ? Math.round((stats.nonVegCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-3">
            <span className="jain-badge" title="Jain (No Root Veg)" />
            <div>
              <div className="text-lg font-extrabold text-neutral-900">{stats.jainCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Strict Jain ({stats.confirmedGuests > 0 ? Math.round((stats.jainCount / stats.confirmedGuests) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Safety buffer selector */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
          <span>Unannounced relative cushion:</span>
          <div className="flex gap-1.5">
            {[0, 5, 10, 15].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBufferPercent(b)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  bufferPercent === b
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
