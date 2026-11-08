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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-900 text-white">
              <QrCode className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h3 className="text-base font-bold text-neutral-900">Scan Realtime RSVP</h3>
              <p className="text-[11px] text-neutral-500">Scan with your smartphone camera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 inline-block shadow-inner">
          <QRCodeSVG
            value={currentUrl}
            size={200}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-neutral-900">
            {event.couple}'s Wedding RSVP
          </div>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
            Scan from your phone on the same Wi-Fi. When you tap submit on your phone, watch this screen update live!
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-neutral-700 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
