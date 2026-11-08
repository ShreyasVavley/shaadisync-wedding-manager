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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-900 text-white shadow-sm">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                How Admins Get Notified (Alert Channels)
              </h3>
              <p className="text-xs text-neutral-500">
                Automated multi-channel alerts so you never miss a guest update on the go.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Active Channels */}
        <div className="space-y-4">
          {/* Channel 1: WhatsApp Bot Direct to Admin */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Channel 1: WhatsApp Instant Admin Bot
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Sends an automated WhatsApp ping to the host's phone the second a guest RSVPs.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Admin Name / Role
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Admin WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs text-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instantAlerts}
                  onChange={(e) => setInstantAlerts(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Instant RSVP Alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer sm:ml-4">
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>9:00 PM Daily Digest</span>
              </label>
            </div>

            {/* Notification Preview */}
            <div className="bg-[#efeae2] p-3 rounded-xl border border-neutral-300 text-xs text-neutral-800 whitespace-pre-wrap font-sans max-h-36 overflow-y-auto">
              {sampleAdminAlertText}
            </div>

            {/* Test Send Button */}
            <a
              href={testWaUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Send WhatsApp Alert to My Phone</span>
            </a>
          </div>

          {/* Channel 2: Realtime Desktop & Smartphone Push Notifications */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-neutral-900 text-white">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Channel 2: Browser &amp; Mobile Lockscreen Push
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Banners appear on your computer or phone screen even when the browser is minimized.
                  </p>
                </div>
              </div>

              {pushPermission === 'granted' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <button
                  onClick={onEnablePushNotifications}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
                >
                  Enable Now
                </button>
              )}
            </div>
          </div>

          {/* Channel 3: Live WebSocket Audio Bell & Dashboard Drawer */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-neutral-900 text-white">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Channel 3: In-App Sound Chime &amp; Notification Bell
                </h4>
                <p className="text-[11px] text-neutral-500">
                  The dashboard plays an audible bell chime, pops up a toast alert, and badges the bell icon with unread counts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-neutral-700 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
