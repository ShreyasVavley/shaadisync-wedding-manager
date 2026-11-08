import React from 'react';
import type { ActivityEvent } from '../types/wedding';
import { Activity, CheckCircle2, XCircle, UserPlus, Clock } from 'lucide-react';

interface LiveActivityFeedProps {
  activities: ActivityEvent[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-900 text-white">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Live RSVP Stream
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              Instant updates as invited families respond over WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 max-h-[380px] overflow-y-auto pr-1 space-y-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No live responses recorded yet. Click "Simulate Live RSVP" to test!
          </div>
        ) : (
          activities.map((act) => {
            const isConfirm = act.type === 'rsvp_confirmed';
            const isDecline = act.type === 'rsvp_declined';

            return (
              <div
                key={act.id}
                className="py-3 flex items-start gap-3 hover:bg-neutral-50/80 transition-colors rounded-lg px-2"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isConfirm && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isDecline && <XCircle className="w-4 h-4 text-rose-500" />}
                  {act.type === 'guest_added' && <UserPlus className="w-4 h-4 text-neutral-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      {act.guestName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                    {act.description}
                  </p>

                  {act.diet && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
                      {act.diet === 'veg' && <span className="veg-badge" />}
                      {act.diet === 'non-veg' && <span className="non-veg-badge" />}
                      {act.diet === 'jain' && <span className="jain-badge" />}
                      <span className="uppercase tracking-wider font-semibold">
                        {act.diet === 'veg' ? 'Vegetarian' : act.diet === 'non-veg' ? 'Non-Vegetarian' : 'Jain'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
