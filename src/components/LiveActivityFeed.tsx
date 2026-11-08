import React from 'react';
import type { ActivityEvent } from '../types/wedding';
import { Activity, CheckCircle2, XCircle, UserPlus, Clock } from 'lucide-react';

interface LiveActivityFeedProps {
  activities: ActivityEvent[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities }) => {
  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-5 text-white">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              WEBSOCKET EVENT BUS
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              Live RSVP Telemetry Stream
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Instant sub-second audit trail as invited families confirm over WhatsApp and Web.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-neutral-800/80 max-h-[420px] overflow-y-auto pr-1 space-y-1">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No live responses recorded yet. Click "Simulate Live RSVP" to test the pipeline!
          </div>
        ) : (
          activities.map((act) => {
            const isConfirm = act.type === 'rsvp_confirmed';
            const isDecline = act.type === 'rsvp_declined';

            return (
              <div
                key={act.id}
                className="py-3.5 flex items-start gap-3 hover:bg-amber-500/5 transition-colors rounded-xl px-2.5"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isConfirm && (
                    <div className="p-1 rounded-full bg-emerald-950/60 border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  {isDecline && (
                    <div className="p-1 rounded-full bg-rose-950/60 border border-rose-500/40">
                      <XCircle className="w-4 h-4 text-rose-400" />
                    </div>
                  )}
                  {act.type === 'guest_added' && (
                    <div className="p-1 rounded-full bg-neutral-800 border border-neutral-700">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {act.guestName}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">
                    {act.description}
                  </p>

                  {act.diet && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium">
                      {act.diet === 'veg' && <span className="veg-badge" />}
                      {act.diet === 'non-veg' && <span className="non-veg-badge" />}
                      {act.diet === 'jain' && <span className="jain-badge" />}
                      <span className="capitalize text-neutral-300">{act.diet}</span>
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
