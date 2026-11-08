import React from 'react';
import { Clock, Users, Sparkles, Car } from 'lucide-react';

interface ArrivalHeatmapProps {
  distribution: Record<string, number>;
  totalConfirmed: number;
}

export const ArrivalHeatmap: React.FC<ArrivalHeatmapProps> = ({
  distribution,
  totalConfirmed,
}) => {
  const times = Object.keys(distribution);
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              RECEPTION RUSH TIMELINE
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Guest Arrival Distribution Heatmap
            </h3>
            <p className="text-xs text-neutral-400">
              Optimal synchronization for Varmala, Stage Photography, and Buffet opening hours.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-amber-300 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-amber-500/30 shadow-sm self-start sm:self-auto">
          <Users className="w-4 h-4 text-amber-400" />
          <span>{totalConfirmed} Guests Scheduled</span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-4 pt-1">
        {times.map((slot) => {
          const count = distribution[slot] || 0;
          const percentage = totalConfirmed > 0 ? Math.round((count / totalConfirmed) * 100) : 0;
          const barWidthPercent = Math.max(4, Math.round((count / maxCount) * 100));
          const isPeak = percentage >= 25;

          return (
            <div key={slot} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white font-mono flex items-center gap-2">
                  <span>{slot}</span>
                  {isPeak && (
                    <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      ⚡ Peak Rush
                    </span>
                  )}
                </span>
                <span className="text-neutral-400 font-medium">
                  <span className="font-mono font-bold text-amber-300">{count}</span> guests ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800/80 h-3.5 rounded-full overflow-hidden flex p-0.5 border border-neutral-700/60 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPeak
                      ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                      : percentage > 12
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'bg-neutral-600'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage & Valet Logistics Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-800/80">
        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
          <Car className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white">Valet &amp; Gate Alert:</span>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Expect highest vehicle arrivals between 07:30 PM – 08:30 PM. Keep 8 valet drivers stationed at Taj Palace Porch.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white">Varmala Timing:</span>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Scheduled for 08:15 PM when 82% of confirmed guests have entered the royal grand ballroom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
