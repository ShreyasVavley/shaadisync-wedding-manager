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
import { DigitalGatePassModal } from './DigitalGatePassModal';
import { EditGuestModal } from './EditGuestModal';
import { exportBanquetMasterCSV } from '../utils/exportBanquetPack';
import { ShimmerButton } from './ui/shimmer-button';
import { InteractiveButton } from './ui/interactive-button';
import { BackgroundPattern } from './ui/background-pattern';
import {
  Users,
  UserCheck,
  UserX,
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
  ListFilter,
  Download,
  Building2,
  Volume2,
  VolumeX,
  Bell,
  Send,

  Lock,
  MessageSquare,
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
  onLock?: () => void;
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
  onLock,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'catering' | 'arrival' | 'rooms' | 'stream'>('roster');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isAdminAlertsOpen, setIsAdminAlertsOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [selectedWhatsAppGuest, setSelectedWhatsAppGuest] = useState<Guest | null>(null);
  const [selectedBatchGuests, setSelectedBatchGuests] = useState<Guest[] | null>(null);
  const [selectedGatePassGuest, setSelectedGatePassGuest] = useState<Guest | null>(null);
  const [selectedEditGuest, setSelectedEditGuest] = useState<Guest | null>(null);

  const handleSaveEditedGuest = async (guestId: string, data: Partial<Guest>) => {
    await fetch(`/api/guest/${guestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (confirm(`Are you sure you want to remove "${guestName}" from the wedding guest list?`)) {
      await fetch(`/api/guest/${guestId}`, { method: 'DELETE' });
    }
  };

  const handleBulkStatus = async (guestIds: string[], status: 'confirmed' | 'declined') => {
    await fetch('/api/guests/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestIds, status }),
    });
  };
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    await onSimulateRSVP();
    setTimeout(() => setIsSimulating(false), 500);
  };

  const handleExportCSV = () => {
    exportBanquetMasterCSV(event, stats, guests, rooms);
  };

  // Percentage calculations for the bar from the reel
  const confirmedPercent = stats.totalInvited > 0 ? (stats.confirmedGuests / stats.totalInvited) * 100 : 0;
  const declinedPercent = stats.totalInvited > 0 ? (stats.declinedGuests / stats.totalInvited) * 100 : 0;
  const awaitingPercent = stats.totalInvited > 0 ? (stats.awaitingGuests / stats.totalInvited) * 100 : 0;

  return (
    <BackgroundPattern
      variant="dots"
      spotlight={true}
      spotlightSize={400}
      className="min-h-screen text-neutral-900 pb-16"
    >
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Event Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-serif text-lg font-bold shadow-md ring-2 ring-neutral-950/10">
              A&amp;R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-neutral-400 uppercase">
                  DASHBOARD • WEDDING GUEST MANAGER
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                  INDIA 🇮🇳
                </span>
              </div>
              <h1 className="text-base font-extrabold tracking-tight text-neutral-950">
                {event.couple}'s Wedding Reception
              </h1>
            </div>
          </div>

          {/* 21st.dev Enhanced Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Sync Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? 'text-emerald-600 animate-pulse' : 'text-amber-500'
                }`}
              />
              <span className="text-[11px]">
                {isConnected ? 'Realtime SQLite + WS' : 'Connecting...'}
              </span>
            </div>

            {/* Notification Center Bell with Unread Badge */}
            <NotificationCenter
              activities={activities}
              onEnablePushNotifications={onEnablePushNotifications}
              pushPermission={pushPermission}
            />

            {/* Admin Alert Channels Setup (WhatsApp / Push / Email) */}
            <button
              onClick={() => setIsAdminAlertsOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="How Admin Gets Notified"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Alert Channels</span>
            </button>

            {/* Background Messaging Automation & Webhook Engine */}
            <button
              onClick={() => setIsAutomationModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="Automated Scheduled Messaging & WhatsApp Cloud API Engine"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>WhatsApp Automation</span>
            </button>

            {/* Lock Host Admin Portal */}
            {onLock && (
              <button
                onClick={onLock}
                className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
                title="Lock Host Portal (Requires 4-digit PIN to re-enter)"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden sm:inline">Lock Portal</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition shadow-xs"
              title={soundEnabled ? 'Mute Audio Chime' : 'Unmute Audio Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
            </button>

            {/* 21st.dev Shimmer Button: Simulate Live RSVP */}
            <ShimmerButton
              onClick={handleSimulate}
              disabled={isSimulating}
              shimmerColor="#fbbf24"
              shimmerSize="0.1em"
              borderRadius="12px"
              background="#09090b"
              className="py-1.5 px-3 text-xs font-bold shadow-md"
              title="Simulates a random guest submitting an RSVP over WhatsApp"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Simulate Live RSVP</span>
              </div>
            </ShimmerButton>

            {/* Split Screen Mobile Preview Toggle */}
            <InteractiveButton
              variant={showMobilePreview ? 'primary' : 'secondary'}
              size="sm"
              onClick={onToggleMobilePreview}
              icon={<Smartphone className="w-3.5 h-3.5" />}
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
              className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 active:scale-95 transition shadow-xs text-xs font-bold flex items-center gap-1.5"
              title="Bulk send WhatsApp invitations or 48h reminders to guests"
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Bulk Notify ({stats.awaitingParties})</span>
            </button>

            {/* Scan QR */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition shadow-xs"
              title="Scan QR on physical smartphone"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition shadow-xs"
              title="Export Guest List to Excel / CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Catering Manifest */}
            <button
              onClick={() => setIsManifestOpen(true)}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition shadow-xs"
              title="Print Banquet Catering Sheet"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Add Guest Button */}
            <InteractiveButton
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Guest
            </InteractiveButton>

            {/* Reset Demo Data */}
            <button
              onClick={onResetData}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 active:scale-95 transition"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* KPI Grid (Matching the Reel Frames 00.0s, 24.5s, 38.0s) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Invited */}
          <div className="bg-white/95 rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-1 hover:border-neutral-300 transition-all hover:shadow-md">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 flex items-center justify-between">
              <span>Total Invited</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-neutral-950 font-mono">
              {stats.totalInvited}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              Across {guests.length} families &amp; groups
            </div>
          </div>

          {/* Card 2: Confirmed Attendance */}
          <div className="bg-white/95 rounded-2xl border border-neutral-950 p-5 shadow-md space-y-1 relative overflow-hidden ring-1 ring-neutral-950/5 hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-950/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-900 flex items-center justify-between">
              <span>Confirmed</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-neutral-950 font-mono">
              {stats.confirmedGuests}
            </div>
            <div className="text-[11px] text-neutral-600 font-medium">
              {stats.confirmedParties} parties attending • {stats.responseRate}% responded
            </div>
          </div>

          {/* Card 3: Not Attending */}
          <div className="bg-white/95 rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-1 hover:border-neutral-300 transition-all hover:shadow-md">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 flex items-center justify-between">
              <span>Not Attending</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-neutral-950 font-mono">
              {stats.declinedGuests}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {stats.declinedParties} parties sent regrets
            </div>
          </div>

          {/* Card 4: Awaiting Response */}
          <div className="bg-white/95 rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-1 hover:border-neutral-300 transition-all hover:shadow-md">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 flex items-center justify-between">
              <span>Awaiting Response</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-neutral-950 font-mono">
              {stats.awaitingGuests}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {stats.awaitingParties} parties pending confirmation
            </div>
          </div>
        </div>

        {/* Multi-Ceremony Attendance Breakdown Strip */}
        {event.subEvents && event.subEvents.length > 0 && stats.subEventHeadcounts && (
          <div className="bg-white/95 rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-neutral-400">
                CEREMONY-BY-CEREMONY CONFIRMED HEADCOUNTS
              </div>
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Taj Palace Kitchens
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {event.subEvents.map((c) => {
                const counts = stats.subEventHeadcounts?.[c.id] || { totalPax: 0, parties: 0 };
                return (
                  <div key={c.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-1">
                    <div className="text-xs font-bold text-neutral-900 truncate">{c.ceremony}</div>
                    <div className="text-2xl font-black text-neutral-950 font-mono">
                      {counts.totalPax} <span className="text-xs font-normal text-neutral-500">pax</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">
                      {c.date.split(',')[0]} • {c.mealType}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimalist Progress Bar Card (Matching Frame 38.0s & 39.5s from the Reel) */}
        <div className="bg-white/95 rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-neutral-400 uppercase">
                WEDDING DASHBOARD • EXAMPLE FIGURES
              </div>
              <h2 className="text-2xl font-black text-neutral-950 tracking-tight mt-0.5">
                PLAN FOR {stats.confirmedGuests} CONFIRMED GUESTS
              </h2>
            </div>
            <div className="text-xs text-neutral-500">
              <span className="font-bold text-neutral-900">More informed catering decisions</span> • RSVPs help estimate, not guarantee, attendance.
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3.5 bg-neutral-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-neutral-950 h-full transition-all duration-700 ease-out"
                style={{ width: `${confirmedPercent}%` }}
                title={`Confirmed: ${stats.confirmedGuests} (${Math.round(confirmedPercent)}%)`}
              />
              <div
                className="bg-neutral-500 h-full transition-all duration-700 ease-out"
                style={{ width: `${declinedPercent}%` }}
                title={`Declined: ${stats.declinedGuests} (${Math.round(declinedPercent)}%)`}
              />
              <div
                className="bg-neutral-300 h-full transition-all duration-700 ease-out"
                style={{ width: `${awaitingPercent}%` }}
                title={`Awaiting: ${stats.awaitingGuests} (${Math.round(awaitingPercent)}%)`}
              />
            </div>

            {/* Legend matching frame 39.5s */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-neutral-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-950 inline-block" />
                <span>CONFIRMED: <strong className="text-neutral-900 font-mono">{stats.confirmedGuests}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-500 inline-block" />
                <span>NOT ATTENDING: <strong className="text-neutral-900 font-mono">{stats.declinedGuests}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
                <span>AWAITING RESPONSE: <strong className="text-neutral-900 font-mono">{stats.awaitingGuests}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Guest Roster &amp; Invites ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catering')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'catering'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Catering &amp; Wastage Savings</span>
          </button>

          <button
            onClick={() => setActiveTab('arrival')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'arrival'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Arrival Rush Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hotel &amp; Rooms ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === 'stream'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
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
              onViewGatePass={(g) => setSelectedGatePassGuest(g)}
              onEditGuest={(g) => setSelectedEditGuest(g)}
              onDeleteGuest={handleDeleteGuest}
              onBulkUpdateStatus={handleBulkStatus}
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
      {selectedGatePassGuest && (
        <DigitalGatePassModal
          isOpen={!!selectedGatePassGuest}
          onClose={() => setSelectedGatePassGuest(null)}
          guest={selectedGatePassGuest}
          event={event}
        />
      )}

      {selectedEditGuest && (
        <EditGuestModal
          isOpen={!!selectedEditGuest}
          onClose={() => setSelectedEditGuest(null)}
          guest={selectedEditGuest}
          onSave={handleSaveEditedGuest}
          onDelete={(id) => handleDeleteGuest(id, selectedEditGuest.name)}
        />
      )}
    </BackgroundPattern>
  );
};
