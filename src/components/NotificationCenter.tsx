import React, { useState } from 'react';
import type { ActivityEvent } from '../types/wedding';
import { Bell, CheckCircle2, XCircle, BellRing, Check, Smartphone } from 'lucide-react';

interface NotificationCenterProps {
  activities: ActivityEvent[];
  onEnablePushNotifications: () => Promise<void>;
  pushPermission: NotificationPermission;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  activities,
  onEnablePushNotifications,
  pushPermission,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Mark all previous as read when clicked or clear
  const unreadCount = activities.filter((a) => !readIds.has(a.id)).length;

  const markAllAsRead = () => {
    setReadIds(new Set(activities.map((a) => a.id)));
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as viewed
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-2xl border border-amber-500/30 bg-neutral-900/90 text-amber-300 hover:bg-neutral-800 hover:border-amber-400 active:scale-95 transition shadow-sm"
        title="Admin Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl shadow-2xl border border-amber-500/30 z-50 overflow-hidden animate-slide-up text-white">
            {/* Header */}
            <div className="p-3.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">Admin Notification Center</span>
              </div>
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-semibold text-neutral-400 hover:text-amber-300 transition flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            </div>

            {/* Desktop Push Notification Permission Banner */}
            {pushPermission !== 'granted' && (
              <div className="p-3 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-[11px] text-amber-200 font-medium leading-tight">
                    Get alerts when browser tabs are closed
                  </span>
                </div>
                <button
                  onClick={onEnablePushNotifications}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-[10px] font-black rounded-lg hover:from-amber-400 hover:to-amber-500 flex-shrink-0 shadow-sm"
                >
                  Enable
                </button>
              </div>
            )}

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No notifications recorded yet.
                </div>
              ) : (
                activities.slice(0, 15).map((act) => {
                  const isConfirmed = act.type === 'rsvp_confirmed';
                  const isDeclined = act.type === 'rsvp_declined';

                  return (
                    <div
                      key={act.id}
                      className="p-3 hover:bg-neutral-800/60 transition-colors flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isConfirmed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isDeclined && <XCircle className="w-4 h-4 text-rose-400" />}
                        {act.type === 'guest_added' && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[9px] font-black">
                            +
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {act.guestName}
                          </span>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-neutral-950/80 text-center border-t border-neutral-800 text-[10px] text-amber-400/80 font-black uppercase tracking-wider">
              Realtime WebSocket Push Active
            </div>
          </div>
        </>
      )}
    </div>
  );
};
