import React from 'react';
import type { EventDetails, EventStats, Guest } from '../types/wedding';
import { X, Printer, FileText } from 'lucide-react';

interface CateringManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  stats: EventStats;
  guests: Guest[];
}

export const CateringManifestModal: React.FC<CateringManifestModalProps> = ({
  isOpen,
  onClose,
  event,
  stats,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-amber-500/30 space-y-6 max-h-[90vh] overflow-y-auto print:shadow-none print:border-none print:max-h-full print:rounded-none">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-neutral-950 text-white shadow-md">
              <FileText className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">
                OFFICIAL PRINTABLE MANIFEST
              </div>
              <h3 className="text-base font-black text-neutral-900">
                Banquet &amp; Catering Guarantee Manifest
              </h3>
              <p className="text-xs text-neutral-500">
                Formatted for Taj Palace F&amp;B Director &amp; Executive Chef
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black flex items-center gap-2 transition shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 font-sans text-neutral-900">
          {/* Document Top Details */}
          <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400">
                OFFICIAL CATERING SPECIFICATION
              </div>
              <h1 className="text-2xl font-black text-neutral-950 mt-1">
                {event.couple} Wedding Reception
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                {event.venue}, {event.city} • {event.date}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-neutral-900">
                DATE GENERATED
              </div>
              <div className="text-xs text-neutral-500">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Guaranteed Numbers Summary Box */}
          <div className="grid grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Total Invited
              </div>
              <div className="text-xl font-black text-neutral-900">{stats.totalInvited}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Confirmed Plates
              </div>
              <div className="text-xl font-black text-emerald-600">{stats.confirmedGuests}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Declined
              </div>
              <div className="text-xl font-black text-rose-600">{stats.declinedGuests}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Recommended Buffer
              </div>
              <div className="text-xl font-black text-neutral-900">
                +{Math.ceil(stats.confirmedGuests * 0.05)} (5%)
              </div>
            </div>
          </div>

          {/* Dietary Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
              Kitchen Preparation Breakdown
            </h4>
            <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-100 text-[10px] uppercase font-bold text-neutral-600">
                <tr>
                  <th className="py-2.5 px-3 text-left">Dietary Category</th>
                  <th className="py-2.5 px-3 text-center">Guaranteed Count</th>
                  <th className="py-2.5 px-3 text-center">% of Total</th>
                  <th className="py-2.5 px-3 text-left">Kitchen Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                    <span className="veg-badge" /> Pure Vegetarian
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{stats.vegCount}</td>
                  <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                    {stats.confirmedGuests > 0 ? Math.round((stats.vegCount / stats.confirmedGuests) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px]">Separate vegetarian prep line &amp; oil</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                    <span className="non-veg-badge" /> Non-Vegetarian
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{stats.nonVegCount}</td>
                  <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                    {stats.confirmedGuests > 0 ? Math.round((stats.nonVegCount / stats.confirmedGuests) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px]">Kebabs, Biryani, Mutton/Chicken Gravy</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                    <span className="jain-badge" /> Strict Jain Food
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{stats.jainCount}</td>
                  <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                    {stats.confirmedGuests > 0 ? Math.round((stats.jainCount / stats.confirmedGuests) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px]">Strictly no onion, garlic, or root vegetables</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures Line */}
          <div className="pt-8 border-t border-neutral-200 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-6">
              <div className="border-b border-neutral-400 w-48" />
              <div>
                <div className="font-bold text-neutral-900">Host Representative Signature</div>
                <div className="text-[11px] text-neutral-500">Aarav &amp; Family</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border-b border-neutral-400 w-48" />
              <div>
                <div className="font-bold text-neutral-900">Banquet &amp; F&amp;B Manager Signature</div>
                <div className="text-[11px] text-neutral-500">Taj Palace Hotel Catering Team</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
