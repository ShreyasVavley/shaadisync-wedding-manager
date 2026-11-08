import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Share2, Calendar, Clock, Car, CheckCircle2, Utensils } from 'lucide-react';
import type { Guest, EventDetails } from '../types/wedding';

interface DigitalGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  event: EventDetails;
}

export const DigitalGatePassModal: React.FC<DigitalGatePassModalProps> = ({
  isOpen,
  onClose,
  guest,
  event,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const passUrl = `${window.location.origin}?guest=${guest.magicToken}&pass=1`;
  const shareText = `🎟️ *Digital Wedding Entry Pass: ${event.couple}'s Wedding*\n\nDear ${guest.name},\nYour digital gate pass & valet QR code for ${event.venue} is ready:\n👉 ${passUrl}\n\nPlease show this at the entrance and valet desk!`;
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const verificationPayload = JSON.stringify({
    passId: `PASS-${guest.magicToken.toUpperCase()}`,
    guest: guest.name,
    pax: guest.attendingCount,
    diet: guest.diet,
    table: guest.tableNumber || 'Main Banquet',
    venue: event.venue,
  });

  const confirmedCeremonies = event.subEvents
    ? event.subEvents.filter((ev) => !guest.subEvents || guest.subEvents[ev.id] !== false)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden space-y-0 animate-slide-up print:shadow-none print:border-none print:max-h-full print:rounded-none">
        {/* Top Controls Bar (hidden during print) */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">Official Digital Wedding Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
              title="Print Pass"
            >
              <Printer className="w-4 h-4" />
            </button>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Apple Wallet Style Pass Card */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white relative">
          {/* Decorative Corner Seals */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                ROYAL WEDDING PASS · TAJ PALACE
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                {event.couple}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center font-serif text-sm font-bold text-white shadow-inner">
              A &amp; R
            </div>
          </div>

          {/* Guest Name & Pax Badge */}
          <div className="bg-neutral-800/80 rounded-2xl p-4 border border-neutral-700/80 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Guest / Family
                </span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {guest.name}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {guest.phone}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-700/60 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Attending Headcount</span>
                <div className="font-extrabold text-white font-mono text-sm">
                  {guest.attendingCount} {guest.attendingCount === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Dietary Commitment</span>
                <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">{guest.diet || 'Veg'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmed Functions / Sub-Events Pills */}
          {confirmedCeremonies.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Access Granted to Ceremonies ({confirmedCeremonies.length})
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {confirmedCeremonies.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <div className="truncate">
                      <div className="font-bold text-neutral-200 truncate">{c.ceremony}</div>
                      <div className="text-[9px] text-neutral-400">{c.mealType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Verification Section */}
          <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-center space-y-2 text-neutral-900 shadow-md">
            <QRCodeSVG
              value={verificationPayload}
              size={140}
              level="M"
              includeMargin={false}
              className="rounded"
            />
            <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-500 pt-1">
              SCAN AT TAJ PALACE MAIN PORCH
            </div>
          </div>

          {/* Valet Parking & Logistics Strip */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-3">
            <Car className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold text-white block">Priority Valet Parking Pass</span>
              Present this pass at Taj Palace Porch Lane 1 for complimentary valet parking.
            </div>
          </div>

          {/* Date & Time Footer */}
          <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Expected: {guest.arrivalTime || '07:30 PM'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions (hidden during print) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Pass</span>
          </button>
          <a
            href={waShareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
