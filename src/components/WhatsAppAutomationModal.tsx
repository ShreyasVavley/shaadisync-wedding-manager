import React, { useState } from 'react';
import type { Guest, EventDetails } from '../types/wedding';
import { X, MessageSquare, Copy, Check, Send } from 'lucide-react';

interface WhatsAppAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  event: EventDetails;
}

export const WhatsAppAutomationModal: React.FC<WhatsAppAutomationModalProps> = ({
  isOpen,
  onClose,
  guest,
  event,
}) => {
  const [templateType, setTemplateType] = useState<'invite' | 'reminder' | 'dayOf'>('invite');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !guest) return null;

  const magicLink = `${window.location.origin}?guest=${guest.magicToken}`;

  const getMessageContent = () => {
    if (templateType === 'invite') {
      return `✨ *Wedding Invitation: ${event.couple}* ✨\n\nDear ${guest.name},\n\nTogether with our families, we cordially invite you to celebrate our Wedding Reception & Sangeet! 🎉\n\n📅 *Date:* ${event.date}\n⏰ *Time:* ${event.time}\n📍 *Venue:* ${event.venue}, ${event.city}\n\nTo help our catering and seating arrangements, please take 10 seconds to confirm your attendance, party size, and food preference here:\n👉 ${magicLink}\n\nWe would be honored to celebrate with you!\nWarm regards,\n*Aarav & Riya*`;
    } else if (templateType === 'reminder') {
      return `🙏 *Gentle Reminder: RSVP for ${event.couple}'s Wedding* 🙏\n\nNamaste ${guest.name},\n\nWe are finalizing our banquet headcount and fresh catering preparations for *${event.date}*.\n\nCould you kindly confirm if your family will be joining us and your meal preferences?\n👉 ${magicLink}\n\nIt takes just 1 click and helps us ensure zero food wastage. Thank you so much!\n\nWith love,\n*Aarav & Riya*`;
    } else {
      return `🎊 *Today is the Day! ${event.couple}'s Wedding Reception* 🎊\n\nDear ${guest.name},\n\nWe cannot wait to celebrate with you tonight!\n\n📍 *Venue:* ${event.venue}\n🗺️ *Directions:* ${event.mapsUrl}\n⏰ *Gates Open:* ${event.time}\n\nYour party details: ${magicLink}\nSee you soon on the dance floor! 🕺💃`;
    }
  };

  const messageText = getMessageContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                WhatsApp Invitation &amp; Reminder Engine
              </h3>
              <p className="text-xs text-neutral-500">
                Personalized for <span className="font-bold text-neutral-900">{guest.name}</span>
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

        {/* Template Selectors */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Select Message Template
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTemplateType('invite')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition ${
                templateType === 'invite'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              1. First Invite
            </button>
            <button
              onClick={() => setTemplateType('reminder')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition ${
                templateType === 'reminder'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              2. 48h Nudge
            </button>
            <button
              onClick={() => setTemplateType('dayOf')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition ${
                templateType === 'dayOf'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              3. Day of Event
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Bubble Mockup */}
        <div className="bg-[#efeae2] p-4 rounded-2xl border border-neutral-300 relative overflow-hidden font-sans">
          <div className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-2 flex items-center justify-between">
            <span>WhatsApp Preview ({guest.phone})</span>
            <span className="text-emerald-700 font-bold">🟢 Online</span>
          </div>

          <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm text-xs text-neutral-800 space-y-2 whitespace-pre-wrap max-h-56 overflow-y-auto border border-neutral-200/50">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 text-xs font-bold text-neutral-700 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 text-xs font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
