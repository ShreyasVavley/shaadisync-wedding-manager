import React, { useState } from 'react';
import type { EventDetails, EventStats, Guest, ActivityEvent, HotelRoom } from '../types/wedding';
import { CateringEstimator } from './CateringEstimator';
import { ArrivalHeatmap } from './ArrivalHeatmap';
import { LiveActivityFeed } from './LiveActivityFeed';
import { GuestTable } from './GuestTable';
import { HotelRoomManager } from './HotelRoomManager';
import { AddGuestModal } from './AddGuestModal';
import { WhatsAppAutomationModal } from './WhatsAppAutomationModal';
import { QRCodeModal } from './QRCodeModal';
import { CateringManifestModal } from './CateringManifestModal';
import { NotificationCenter } from './NotificationCenter';
import { AdminAlertsModal } from './AdminAlertsModal';
import { BatchNotificationModal } from './BatchNotificationModal';
import { AutomationControlModal } from './AutomationControlModal';
import { ShimmerButton } from './ui/shimmer-button';
import { InteractiveButton } from './ui/interactive-button';
import { BackgroundPattern } from './ui/background-pattern';
import { SparklesCore } from './ui/sparkles';
import { SparklesText } from './ui/sparkles-text';
import { LuxuryCard } from './ui/luxury-card';
import {
  UserCheck,
  Clock,
  Sparkles,
  Smartphone,
  QrCode,
  FileText,
  UserPlus,
  RotateCcw,
  Radio,
  ChefHat,
  BarChart3,
  Download,
  Building2,
  Volume2,
  VolumeX,
  Bell,
  Send,
  Bot,
  Crown,
  Leaf,
  CheckCircle2,
} from 'lucide-react';

interface HostDashboardProps {
  event: EventDetails;
  stats: EventStats;
  guests: Guest[];
  activities: ActivityEvent[];
  rooms: HotelRoom[];
  isConnected: boolean;
  soundEnabled: boolean;
  pushPermission: NotificationPermission;
  onEnablePushNotifications: () => Promise<void>;
  onToggleSound: () => void;
  onSimulateRSVP: () => Promise<void>;
  onResetData: () => Promise<void>;
  onAddGuest: (guestData: any) => Promise<void>;
  onAssignRoom: (roomId: string, guestId: string | null, guestName: string | null) => Promise<void>;
  onSelectGuestForPreview: (guest: Guest) => void;
  onToggleMobilePreview: () => void;
  showMobilePreview: boolean;
  onUpdateCostPerPlate: (cost: number) => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  event,
  stats,
  guests,
  activities,
  rooms,
  isConnected,
  soundEnabled,
  pushPermission,
  onEnablePushNotifications,
  onToggleSound,
  onSimulateRSVP,
  onResetData,
  onAddGuest,
  onAssignRoom,
  onSelectGuestForPreview,
  onToggleMobilePreview,
  showMobilePreview,
  onUpdateCostPerPlate,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'catering' | 'arrival' | 'rooms' | 'stream'>('roster');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isAdminAlertsOpen, setIsAdminAlertsOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [selectedWhatsAppGuest, setSelectedWhatsAppGuest] = useState<Guest | null>(null);
  const [selectedBatchGuests, setSelectedBatchGuests] = useState<Guest[] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    await onSimulateRSVP();
    setTimeout(() => setIsSimulating(false), 500);
  };

  const handleExportCSV = () => {
    window.open('/api/export-csv', '_blank');
  };

  // Percentage calculations for the bar from the reel
  const confirmedPercent = stats.totalInvited > 0 ? (stats.confirmedGuests / stats.totalInvited) * 100 : 0;
  const declinedPercent = stats.totalInvited > 0 ? (stats.declinedGuests / stats.totalInvited) * 100 : 0;
  const awaitingPercent = stats.totalInvited > 0 ? (stats.awaitingGuests / stats.totalInvited) * 100 : 0;

  // Donut SVG circumference calculation (radius: 36, circumference: ~226)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confirmedPercent / 100) * circumference;

  return (
    <BackgroundPattern
      variant="dots"
      spotlight={true}
      spotlightSize={500}
      className="min-h-screen text-white bg-[#09090b] pb-24 relative overflow-hidden"
    >
      {/* 21st.dev Floating Golden Embers & Sparkles Canvas */}
      <SparklesCore
        background="transparent"
        minSize={0.6}
        maxSize={2.0}
        particleDensity={35}
        particleColor="#fbbf24"
        className="pointer-events-none opacity-40"
      />

      {/* Opulent Top Header / Command Navbar */}
      <header className="bg-neutral-950/80 backdrop-blur-2xl border-b border-amber-500/20 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Royal Seal & Event Monogram */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              {/* Rotating Conic Gold Ray */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600 opacity-75 blur-xs group-hover:opacity-100 transition duration-500 animate-spin-slow" />
              {/* Wax Seal Body */}
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#1c1917] border border-amber-400/40 text-amber-200 flex items-center justify-center font-serif text-lg font-black tracking-wider shadow-xl">
                A&amp;R
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-amber-400 uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  ROYAL WEDDING COMMAND CENTER
                </span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  TAJ PALACE 🇮🇳
                </span>
              </div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <SparklesText text={`${event.couple}'s Wedding Reception`} className="text-base" />
              </h1>
            </div>
          </div>

          {/* Luxury Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Sync Status Beacon */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="text-[11px] font-mono">
                {isConnected ? 'Realtime SQLite + WS' : 'Connecting...'}
              </span>
            </div>

            {/* Notification Center Bell */}
            <NotificationCenter
              activities={activities}
              onEnablePushNotifications={onEnablePushNotifications}
              pushPermission={pushPermission}
            />

            {/* Admin Alert Channels Setup */}
            <button
              onClick={() => setIsAdminAlertsOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-amber-500/40 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="Configure How Admin Gets Notified on WhatsApp"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Alerts</span>
            </button>

            {/* Background Messaging Automation & Webhook Engine */}
            <button
              onClick={() => setIsAutomationModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-200 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="Automated Scheduled Messaging & WhatsApp Cloud API Engine"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Automations</span>
            </button>

            {/* Audio Bell Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition"
              title={soundEnabled ? 'Mute Audio Chime' : 'Unmute Audio Chime'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* 21st.dev Shimmer Button: Simulate Live RSVP */}
            <ShimmerButton
              onClick={handleSimulate}
              disabled={isSimulating}
              shimmerColor="#fbbf24"
              shimmerSize="0.1em"
              borderRadius="12px"
              background="#17171c"
              className="py-1.5 px-3.5 text-xs font-bold shadow-lg border border-amber-500/40"
              title="Simulates a random guest submitting an RSVP over WhatsApp"
            >
              <div className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Simulate Live RSVP</span>
              </div>
            </ShimmerButton>

            {/* Split Screen Mobile Preview Toggle */}
            <InteractiveButton
              variant={showMobilePreview ? 'primary' : 'secondary'}
              size="sm"
              onClick={onToggleMobilePreview}
              icon={<Smartphone className="w-3.5 h-3.5 text-amber-400" />}
              title="Toggle iPhone simulator side-by-side"
            >
              {showMobilePreview ? 'Hide Phone' : 'Phone Preview'}
            </InteractiveButton>

            {/* Bulk WhatsApp Notification */}
            <button
              onClick={() => {
                const pending = guests.filter((g) => g.status === 'pending');
                setSelectedBatchGuests(pending.length > 0 ? pending : guests);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="Bulk send WhatsApp invitations or 48h reminders to guests"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bulk Notify ({stats.awaitingParties})</span>
            </button>

            {/* Scan QR */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition"
              title="Scan QR on physical smartphone"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition"
              title="Export Guest List to Excel / CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Catering Manifest */}
            <button
              onClick={() => setIsManifestOpen(true)}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition"
              title="Print Banquet Catering Sheet"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Add Guest Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={onResetData}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 active:scale-95 transition"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Luxury Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 relative z-10">
        {/* Opulent 4-Card 21st.dev Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento Card 1: Total Royal Invites */}
          <LuxuryCard variant="gold" className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-amber-400/80 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                TOTAL INVITED
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {guests.length} Parties
              </span>
            </div>

            <div className="py-2">
              <div className="text-5xl font-black tracking-tight font-serif gold-foil-text">
                {stats.totalInvited}
              </div>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                <span>Total Headcount</span>
                <span>•</span>
                <span className="text-neutral-300">₹{stats.estimatedCost.toLocaleString('en-IN')} Budget</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                12 Family
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                8 Friends
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                4 VIPs
              </span>
            </div>
          </LuxuryCard>

          {/* Bento Card 2: Confirmed Attendance (Hero Bento with SVG Donut Gauge) */}
          <LuxuryCard variant="emerald" className="p-5 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                CONFIRMED ATTENDANCE
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-5xl font-black tracking-tight font-mono text-emerald-400">
                  {stats.confirmedGuests}
                </div>
                <div className="text-xs text-emerald-300/80 font-medium mt-1">
                  {stats.confirmedParties} parties attending
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  ₹{stats.confirmedCost.toLocaleString('en-IN')} banquet commit
                </div>
              </div>

              {/* Radial Donut Progress Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-emerald-300 font-mono">
                    {stats.responseRate}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                    RSVP
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 text-[10px] text-emerald-400/90">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Zero no-show waste on confirmed plates</span>
            </div>
          </LuxuryCard>

          {/* Bento Card 3: Catering Food Wastage Prevented (Hero Metric) */}
          <LuxuryCard variant="gold" className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-amber-300 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                CATERING SAVINGS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                NO WASTE
              </span>
            </div>

            <div className="py-2">
              <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-amber-400">
                ₹{stats.potentialSavings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Saved by not over-ordering unconfirmed plates
              </div>
            </div>

            {/* Equivalent Ingredients Saved Pills */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                🥗 ~12.5 kg Paneer
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                🍚 ~18 kg Basmati
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                🍮 45 Desserts
              </span>
            </div>
          </LuxuryCard>

          {/* Bento Card 4: Awaiting Confirmation (Urgent Action Card) */}
          <LuxuryCard variant="amber" className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                AWAITING RSVP
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                ACTION REQUIRED
              </span>
            </div>

            <div className="py-2">
              <div className="text-5xl font-black tracking-tight font-mono text-amber-300">
                {stats.awaitingGuests}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {stats.awaitingParties} parties haven't responded yet
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => {
                  const pending = guests.filter((g) => g.status === 'pending');
                  setSelectedBatchGuests(pending.length > 0 ? pending : guests);
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nudge All {stats.awaitingParties} Parties</span>
              </button>
            </div>
          </LuxuryCard>
        </div>

        {/* The Timepiece Catering Allocation Gauge (From the Reel) */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-amber-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ROYAL CATERING GUARANTEE GAUGE
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                PREPARE FOR <span className="gold-foil-text font-serif">{stats.confirmedGuests} CONFIRMED PLATES</span>
              </h2>
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              <span className="text-amber-300 font-bold">Taj Palace F&amp;B Cutoff:</span> 48h prior to event • Guaranteed Zero Food Waste
            </div>
          </div>

          {/* Segmented Timepiece Progress Bar */}
          <div className="space-y-3">
            <div className="w-full h-4 bg-neutral-800/80 rounded-full overflow-hidden flex p-0.5 shadow-inner border border-neutral-700/60">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-l-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ width: `${confirmedPercent}%` }}
                title={`Confirmed: ${stats.confirmedGuests} (${Math.round(confirmedPercent)}%)`}
              />
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                style={{ width: `${awaitingPercent}%` }}
                title={`Awaiting: ${stats.awaitingGuests} (${Math.round(awaitingPercent)}%)`}
              />
              <div
                className="bg-gradient-to-r from-rose-700 to-rose-600 h-full rounded-r-full transition-all duration-700 ease-out"
                style={{ width: `${declinedPercent}%` }}
                title={`Declined: ${stats.declinedGuests} (${Math.round(declinedPercent)}%)`}
              />
            </div>

            {/* Legend & Monetary Breakdown */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-neutral-400 font-medium gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block" />
                <span>
                  CONFIRMED:{' '}
                  <strong className="text-white font-mono text-sm">{stats.confirmedGuests}</strong>{' '}
                  <span className="text-neutral-500 font-normal">
                    (₹{stats.confirmedCost.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] inline-block" />
                <span>
                  AWAITING RESPONSE:{' '}
                  <strong className="text-white font-mono text-sm">{stats.awaitingGuests}</strong>{' '}
                  <span className="text-neutral-500 font-normal">
                    (₹{(stats.awaitingGuests * event.costPerPlate).toLocaleString('en-IN')})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>
                  NOT ATTENDING:{' '}
                  <strong className="text-white font-mono text-sm">{stats.declinedGuests}</strong>{' '}
                  <span className="text-emerald-400 font-normal font-bold">
                    (+₹{stats.potentialSavings.toLocaleString('en-IN')} Saved)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Royal Navigation Tabs */}
        <div className="flex border-b border-neutral-800 overflow-x-auto gap-2 pt-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Guest Roster &amp; Invites ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catering')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'catering'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Catering &amp; Wastage Savings</span>
          </button>

          <button
            onClick={() => setActiveTab('arrival')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'arrival'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Arrival Rush Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Hotel &amp; Rooms ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'stream'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Realtime Stream ({activities.length})</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <GuestTable
              guests={guests}
              onSelectGuestForPreview={onSelectGuestForPreview}
              onOpenWhatsAppModal={(g) => setSelectedWhatsAppGuest(g)}
              onOpenBatchNotificationModal={(selected) => setSelectedBatchGuests(selected)}
            />
          </div>
        )}

        {activeTab === 'catering' && (
          <div className="space-y-6">
            <CateringEstimator
              stats={stats}
              event={event}
              onUpdateCostPerPlate={onUpdateCostPerPlate}
            />
          </div>
        )}

        {activeTab === 'arrival' && (
          <div className="space-y-6">
            <ArrivalHeatmap
              distribution={stats.arrivalDistribution}
              totalConfirmed={stats.confirmedGuests}
            />
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <HotelRoomManager
              rooms={rooms}
              guests={guests}
              onAssignRoom={onAssignRoom}
            />
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="space-y-6">
            <LiveActivityFeed activities={activities} />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGuest={onAddGuest}
      />

      <WhatsAppAutomationModal
        isOpen={!!selectedWhatsAppGuest}
        onClose={() => setSelectedWhatsAppGuest(null)}
        guest={selectedWhatsAppGuest}
        event={event}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={event}
      />

      <CateringManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        event={event}
        stats={stats}
        guests={guests}
      />

      <AdminAlertsModal
        isOpen={isAdminAlertsOpen}
        onClose={() => setIsAdminAlertsOpen(false)}
        event={event}
        stats={stats}
        onEnablePushNotifications={onEnablePushNotifications}
        pushPermission={pushPermission}
      />

      <BatchNotificationModal
        isOpen={!!selectedBatchGuests && selectedBatchGuests.length > 0}
        onClose={() => setSelectedBatchGuests(null)}
        selectedGuests={selectedBatchGuests || []}
        event={event}
        onClearSelection={() => setSelectedBatchGuests(null)}
      />

      <AutomationControlModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        event={event}
        guests={guests}
      />
    </BackgroundPattern>
  );
};
