import React, { useState } from 'react';
import type { EventDetails, EventStats } from '../types/wedding';
import { X, Bell, MessageSquare, Send, Check, Smartphone, ShieldCheck } from 'lucide-react';

interface AdminAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  stats: EventStats;
  onEnablePushNotifications: () => Promise<void>;
  pushPermission: NotificationPermission;
}

export const AdminAlertsModal: React.FC<AdminAlertsModalProps> = ({
  isOpen,
  onClose,
  event,
  stats,
  onEnablePushNotifications,
  pushPermission,
}) => {
  const [adminPhone, setAdminPhone] = useState('+91 98100 12345');
  const [adminName, setAdminName] = useState('Aarav (Groom / Admin)');
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  if (!isOpen) return null;

  // The exact WhatsApp notification sent to the Admin when a guest responds
  const sampleAdminAlertText = `🔔 *New RSVP Received for ${event.couple}'s Wedding!* 🔔\n\n*Guest:* Rajesh & Sunita Sharma\n*Status:* ✅ Confirmed for 4 Guests\n*Diet:* Pure Vegetarian 🟢\n*Expected Arrival:* 07:30 PM\n*Notes:* "Excited! Arriving from Chandigarh by car."\n\n📊 *Current Wedding Stats:* \n• Total Confirmed: ${stats.confirmedGuests} Plates\n• Veg: ${stats.vegCount} | Non-Veg: ${stats.nonVegCount} | Jain: ${stats.jainCount}\n• Catering Savings: ₹${stats.potentialSavings.toLocaleString('en-IN')}\n\n👉 *View Host Dashboard:* ${window.location.origin}`;

  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
  const testWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleAdminAlertText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                MULTI-CHANNEL DISPATCH
              </div>
              <h3 className="text-base font-black text-white">
                How Hosts &amp; Admins Get Notified
              </h3>
              <p className="text-xs text-neutral-400">
                Automated multi-channel alerts so you never miss a guest update on the go.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Active Channels */}
        <div className="space-y-4">
          {/* Channel 1: WhatsApp Bot Direct to Admin */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    Channel 1: WhatsApp Instant Admin Bot
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Sends an automated WhatsApp ping to the host's phone the second a guest RSVPs.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Admin Name / Role
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Admin WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instantAlerts}
                  onChange={(e) => setInstantAlerts(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 border-neutral-700"
                />
                <span>Instant RSVP Alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer sm:ml-4">
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 border-neutral-700"
                />
                <span>9:00 PM Daily Digest</span>
              </label>
            </div>

            {/* Notification Preview */}
            <div className="bg-[#0b141a] text-neutral-200 p-3 rounded-xl border border-neutral-700/60 text-xs whitespace-pre-wrap font-sans max-h-36 overflow-y-auto">
              {sampleAdminAlertText}
            </div>

            {/* Test Send Button */}
            <a
              href={testWaUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black flex items-center justify-center gap-2 transition shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Send WhatsApp Alert to My Phone</span>
            </a>
          </div>

          {/* Channel 2: Realtime Desktop & Smartphone Push Notifications */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-neutral-800 text-amber-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Channel 2: Browser &amp; Mobile Lockscreen Push
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Banners appear on your computer or phone screen even when the browser is closed.
                  </p>
                </div>
              </div>

              {pushPermission === 'granted' ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <button
                  onClick={onEnablePushNotifications}
                  className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 transition shadow"
                >
                  Enable Now
                </button>
              )}
            </div>
          </div>

          {/* Channel 3: Live WebSocket Audio Bell & Dashboard Drawer */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-neutral-800 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Channel 3: In-App Web Audio Bell &amp; Realtime Toast
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Dashboard plays a harmonized dual-frequency Web Audio chime (587Hz &amp; 440Hz), shows glowing toasts, and badges the bell icon live.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-neutral-300 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
