import React, { useState } from 'react';
import type { GuestCategory } from '../types/wedding';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guestData: {
    name: string;
    phone: string;
    category: GuestCategory;
    invitedCount: number;
  }) => Promise<void>;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [category, setCategory] = useState<GuestCategory>('family');
  const [invitedCount, setInvitedCount] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddGuest({
        name: name.trim(),
        phone: phone.trim(),
        category,
        invitedCount: Number(invitedCount) || 2,
      });
      setName('');
      setPhone('+91 ');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add guest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 space-y-5 animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                ROYAL GUEST LEDGER
              </div>
              <h3 className="text-base font-black text-white">Add New Guest / Family</h3>
              <p className="text-xs text-neutral-400">
                Instantly provisions a personalized magic RSVP link.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              Guest / Family Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand & Divya Khurana"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              WhatsApp Phone Number *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuestCategory)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-amber-400 transition"
              >
                <option value="family">Family &amp; Relatives</option>
                <option value="friends">Friends &amp; Batchmates</option>
                <option value="colleagues">Colleagues &amp; Work</option>
                <option value="vip">VIP / Dignitaries</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                Invited Headcount
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={invitedCount}
                onChange={(e) => setInvitedCount(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-amber-400 font-mono transition"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-neutral-300 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs font-black text-neutral-950 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enrolling...' : 'Add to Royal Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
