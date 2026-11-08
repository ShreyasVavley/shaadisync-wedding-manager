import React, { useState } from 'react';
import type { Guest, EventDetails } from '../types/wedding';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';

interface BatchNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGuests: Guest[];
  event: EventDetails;
  onClearSelection: () => void;
}

export const BatchNotificationModal: React.FC<BatchNotificationModalProps> = ({
  isOpen,
  onClose,
  selectedGuests,
  event,
  onClearSelection,
}) => {
  const [templateType, setTemplateType] = useState<'reminder' | 'invite' | 'dayOf' | 'custom'>('reminder');
  const [customText, setCustomText] = useState(
    `Namaste {name},\n\nA quick update regarding {couple}'s wedding reception at {venue} on {date}.\n\nPlease review your party details here:\n👉 {link}\n\nWarm regards,\n{couple}`
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentGuestIds, setSentGuestIds] = useState<Set<string>>(new Set());
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  if (!isOpen || selectedGuests.length === 0) return null;

  const totalPax = selectedGuests.reduce((acc, g) => acc + g.invitedCount, 0);
  const pendingCount = selectedGuests.filter((g) => g.status === 'pending').length;
  const confirmedCount = selectedGuests.filter((g) => g.status === 'confirmed').length;

  // Build message for any guest
  const buildMessage = (guest: Guest) => {
    const magicLink = `${window.location.origin}?guest=${guest.magicToken}`;

    if (templateType === 'reminder') {
      return `🙏 *Gentle Reminder: RSVP for ${event.couple}'s Wedding* 🙏\n\nNamaste ${guest.name},\n\nWe are finalizing our banquet headcount and fresh catering preparations for *${event.date}* at *${event.venue}*.\n\nCould you kindly confirm if your family will be joining us and your meal preferences?\n👉 ${magicLink}\n\nIt takes just 10 seconds and helps us eliminate banquet food wastage. Thank you so much!\n\nWith love,\n*${event.couple}*`;
    } else if (templateType === 'invite') {
      return `✨ *Wedding Invitation: ${event.couple}* ✨\n\nDear ${guest.name},\n\nTogether with our families, we cordially invite you to celebrate our Wedding Reception & Sangeet! 🎉\n\n📅 *Date:* ${event.date}\n⏰ *Time:* ${event.time}\n📍 *Venue:* ${event.venue}, ${event.city}\n\nTo help our catering and seating arrangements, please take 10 seconds to confirm your attendance, party size, and food preference here:\n👉 ${magicLink}\n\nWe would be honored to celebrate with you!\nWarm regards,\n*${event.couple}*`;
    } else if (templateType === 'dayOf') {
      return `🎊 *Today is the Day! ${event.couple}'s Wedding Reception* 🎊\n\nDear ${guest.name},\n\nWe cannot wait to celebrate with you tonight!\n\n📍 *Venue:* ${event.venue}\n🗺️ *Directions:* ${event.mapsUrl}\n⏰ *Gates Open:* ${event.time}\n\nYour party details: ${magicLink}\nSee you soon on the dance floor! 🕺💃`;
    } else {
      return customText
        .replace(/{name}/g, guest.name)
        .replace(/{couple}/g, event.couple)
        .replace(/{venue}/g, event.venue)
        .replace(/{date}/g, event.date)
        .replace(/{link}/g, magicLink);
    }
  };

  const currentGuest = selectedGuests[currentIndex] || selectedGuests[0];
  const sampleMessage = buildMessage(currentGuest);

  // Copy all formatted messages to clipboard
  const handleCopyAll = () => {
    const allFormatted = selectedGuests
      .map((g, idx) => {
        return `[${idx + 1}] Guest: ${g.name} (${g.phone})\n${buildMessage(g)}\n${'='.repeat(40)}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(allFormatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Launch WhatsApp for current guest in queue
  const handleSendCurrent = () => {
    if (!currentGuest) return;
    const msg = buildMessage(currentGuest);
    const cleanPhone = currentGuest.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setSentGuestIds((prev) => new Set([...prev, currentGuest.id]));

    if (currentIndex < selectedGuests.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkipCurrent = () => {
    if (currentIndex < selectedGuests.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Broadcast / Record Activity on Server
  const handleConfirmDispatched = async () => {
    setIsBroadcasting(true);
    try {
      const templateNames = {
        reminder: '48h Catering Finalization Nudge',
        invite: 'Wedding Invitation RSVP',
        dayOf: 'Day-of Event Reminders',
        custom: 'Custom Host Announcement',
      };

      await fetch('/api/notify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: selectedGuests.map((g) => g.id),
          templateType,
          templateTitle: templateNames[templateType],
        }),
      });

      setBroadcastSuccess(true);
      setTimeout(() => {
        setBroadcastSuccess(false);
        onClearSelection();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Batch notification failed', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const progressPercent = Math.round((sentGuestIds.size / selectedGuests.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 space-y-5 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Bulk WhatsApp &amp; Guest Dispatcher
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  BATCH MODE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Sending to <span className="font-bold text-amber-300">{selectedGuests.length} parties</span> ({totalPax} invited pax) • {pendingCount} awaiting, {confirmedCount} confirmed
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

        {/* Template Selector Pills */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>Choose Message Template</span>
            <span className="text-neutral-500 font-normal lowercase">auto-inserts personal magic links</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setTemplateType('reminder')}
              className={`p-2.5 rounded-xl text-left border transition ${
                templateType === 'reminder'
                  ? 'border-amber-400 bg-amber-950/40 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">1. 48h Nudge</div>
              <div className={`text-[10px] ${templateType === 'reminder' ? 'text-amber-300' : 'text-neutral-500'}`}>
                Zero food waste
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('invite')}
              className={`p-2.5 rounded-xl text-left border transition ${
                templateType === 'invite'
                  ? 'border-amber-400 bg-amber-950/40 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">2. First Invite</div>
              <div className={`text-[10px] ${templateType === 'invite' ? 'text-amber-300' : 'text-neutral-500'}`}>
                With 1-tap RSVP
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('dayOf')}
              className={`p-2.5 rounded-xl text-left border transition ${
                templateType === 'dayOf'
                  ? 'border-amber-400 bg-amber-950/40 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">3. Day-Of Event</div>
              <div className={`text-[10px] ${templateType === 'dayOf' ? 'text-amber-300' : 'text-neutral-500'}`}>
                Gates &amp; directions
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('custom')}
              className={`p-2.5 rounded-xl text-left border transition ${
                templateType === 'custom'
                  ? 'border-amber-400 bg-amber-950/40 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">4. Custom Text</div>
              <div className={`text-[10px] ${templateType === 'custom' ? 'text-amber-300' : 'text-neutral-500'}`}>
                Custom broadcast
              </div>
            </button>
          </div>
        </div>

        {/* Custom text editor if selected */}
        {templateType === 'custom' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Custom Message (Variables: {'{name}'}, {'{couple}'}, {'{venue}'}, {'{date}'}, {'{link}'})
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>
        )}

        {/* WhatsApp Preview Bubble */}
        <div className="bg-[#1e2428] p-4 rounded-2xl border border-neutral-700/80 relative font-sans space-y-2">
          <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Preview for #{currentIndex + 1}: <strong className="text-white">{currentGuest.name}</strong></span>
              <span className="font-mono text-[10px] text-neutral-400">({currentGuest.phone})</span>
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              WhatsApp Ready
            </span>
          </div>

          <div className="bg-[#0b141a] text-neutral-200 rounded-xl rounded-tl-none p-3.5 shadow-md text-xs space-y-2 whitespace-pre-wrap max-h-40 overflow-y-auto border border-neutral-700/50">
            {sampleMessage}
          </div>
        </div>

        {/* Step-by-Step 1-Click Sequence Dispatcher */}
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Sequential Sender Queue</span>
              <span className="text-neutral-400 font-normal">
                ({currentIndex + 1} of {selectedGuests.length})
              </span>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 font-mono">
              {sentGuestIds.size} Sent ({progressPercent}%)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Queue Navigation & Launch Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-neutral-400">
              Target: <span className="font-bold text-white">{currentGuest.name}</span>{' '}
              {sentGuestIds.has(currentGuest.id) && (
                <span className="text-emerald-400 font-bold ml-1.5 inline-flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Dispatched
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSkipCurrent}
                disabled={currentIndex >= selectedGuests.length - 1}
                className="px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl bg-neutral-800 border border-neutral-700 disabled:opacity-30 transition"
              >
                Skip
              </button>

              <button
                type="button"
                onClick={handleSendCurrent}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 shadow-md flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch WhatsApp for #{currentIndex + 1}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Copy All Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
            <span>{copiedAll ? 'All Messages Copied!' : 'Copy All Links & Messages'}</span>
          </button>

          {/* Mark All Dispatched / Log Activity */}
          <ShimmerButton
            onClick={handleConfirmDispatched}
            disabled={isBroadcasting}
            shimmerColor="#10b981"
            shimmerSize="0.1em"
            borderRadius="12px"
            background="#09090b"
            className="py-3 px-4 text-xs font-black text-white shadow-xl flex items-center justify-center gap-2 border border-emerald-500/30"
          >
            {broadcastSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Logged to Realtime Stream!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Complete Batch &amp; Broadcast</span>
              </div>
            )}
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
};
