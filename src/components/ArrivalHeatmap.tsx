import React from 'react';
import { Clock, Users } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-900 text-white">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Guest Arrival Rush Timeline
            </h3>
            <p className="text-xs text-neutral-500">
              Helps timing the Varmala, Stage photos, and Buffet opening hours.
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-neutral-700" />
          <span>{totalConfirmed} Guests Scheduled</span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-3 pt-2">
        {times.map((slot) => {
          const count = distribution[slot] || 0;
          const percentage = totalConfirmed > 0 ? Math.round((count / totalConfirmed) * 100) : 0;
          const barWidthPercent = Math.max(4, Math.round((count / maxCount) * 100));

          return (
            <div key={slot} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-800 font-mono">{slot}</span>
                <span className="text-neutral-500 font-medium">
                  <span className="font-bold text-neutral-900">{count}</span> guests ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage > 30
                      ? 'bg-neutral-900'
                      : percentage > 15
                      ? 'bg-neutral-700'
                      : 'bg-neutral-400'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Indian Wedding Insight Tip */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
        <span className="text-base">💡</span>
        <div>
          <span className="font-bold">Banquet Pro-Tip:</span> In Indian weddings, peak buffet demand typically occurs between 8:30 PM – 9:30 PM. Keep live chaat counters fully staffed by 7:30 PM!
        </div>
      </div>
    </div>
  );
};
