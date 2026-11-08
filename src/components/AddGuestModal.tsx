import React, { useState } from 'react';
import type { GuestCategory } from '../types/wedding';
import { X, UserPlus } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-900 text-white">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Add New Guest / Family</h3>
              <p className="text-xs text-neutral-500">
                Generates a unique magic RSVP link instantly.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
              Guest / Family Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand & Divya Khurana"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
              WhatsApp Phone Number *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuestCategory)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition bg-white"
              >
                <option value="family">Family &amp; Relatives</option>
                <option value="friends">Friends &amp; Batchmates</option>
                <option value="colleagues">Colleagues &amp; Work</option>
                <option value="vip">VIP / Dignitaries</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                Number of Invites
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={invitedCount}
                onChange={(e) => setInvitedCount(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono transition"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-neutral-600 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs font-bold text-white rounded-xl bg-neutral-950 hover:bg-neutral-800 transition shadow"
            >
              {isSubmitting ? 'Adding...' : 'Add to Guest List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
