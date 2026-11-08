import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';
import type { EventDetails } from '../types/wedding';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null;

  const currentUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 text-center space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </span>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                ROYAL DIGITAL PASS
              </div>
              <h3 className="text-base font-black text-white">Scan Realtime RSVP</h3>
              <p className="text-[11px] text-neutral-400">Scan with your smartphone camera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container with Gold Glow */}
        <div className="p-4 bg-white rounded-2xl border-2 border-amber-400/60 inline-block shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
          <QRCodeSVG
            value={currentUrl}
            size={200}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-serif font-black gold-foil-text tracking-wide">
            {event.couple}'s Wedding RSVP
          </div>
          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Open your camera to scan this digital invitation. Submit an RSVP on your phone to watch the Host Command Center update live in real-time!
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-neutral-300 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:text-white transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
