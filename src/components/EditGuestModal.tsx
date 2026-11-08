import React, { useState, useEffect } from 'react';
import type { Guest, DietPreference, GuestCategory } from '../types/wedding';
import { X, Save, Trash2, User, Phone, Check } from 'lucide-react';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onSave: (guestId: string, data: Partial<Guest>) => Promise<void>;
  onDelete: (guestId: string) => Promise<void>;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<GuestCategory>('family');
  const [status, setStatus] = useState<'confirmed' | 'declined' | 'pending'>('pending');
  const [invitedCount, setInvitedCount] = useState(2);
  const [attendingCount, setAttendingCount] = useState(2);
  const [diet, setDiet] = useState<DietPreference | 'none'>('veg');
  const [arrivalTime, setArrivalTime] = useState('07:30 PM');
  const [songRequest, setSongRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [subEvents, setSubEvents] = useState<Record<string, boolean>>({
    haldi: true,
    sangeet: true,
    wedding: true,
    reception: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (guest) {
      setName(guest.name || '');
      setPhone(guest.phone || '');
      setCategory(guest.category || 'family');
      setStatus(guest.status || 'pending');
      setInvitedCount(guest.invitedCount || 2);
      setAttendingCount(guest.attendingCount > 0 ? guest.attendingCount : guest.invitedCount || 2);
      setDiet(guest.diet || 'veg');
      setArrivalTime(guest.arrivalTime || '07:30 PM');
      setSongRequest(guest.songRequest || '');
      setNotes(guest.notes || '');
      setSubEvents(
        guest.subEvents || {
          haldi: guest.category === 'family',
          sangeet: guest.category === 'family' || guest.category === 'friends',
          wedding: guest.category === 'family' || guest.category === 'vip',
          reception: true,
        }
      );
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  const handleToggleSubEvent = (key: string) => {
    setSubEvents((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(guest.id, {
        name,
        phone,
        category,
        status,
        invitedCount: Number(invitedCount),
        attendingCount: status === 'confirmed' ? Number(attendingCount) : 0,
        diet: status === 'confirmed' && diet !== 'none' ? (diet as DietPreference) : null,
        arrivalTime: status === 'confirmed' ? arrivalTime : null,
        songRequest: songRequest || undefined,
        notes: notes || undefined,
        subEvents: status === 'confirmed' ? subEvents : undefined,
      });
      onClose();
    } catch (err) {
      alert('Failed to save guest details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove "${guest.name}" from the wedding guest list?`)) {
      setDeleting(true);
      try {
        await onDelete(guest.id);
        onClose();
      } catch (err) {
        alert('Failed to delete guest.');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <span>Edit Guest Details</span>
              <span className="text-xs font-mono font-normal text-neutral-400">({guest.id})</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Update RSVPs, headcounts, dietary preparations, and ceremony attendance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Guest Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Guest / Family Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                WhatsApp / Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Relationship Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuestCategory)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition font-medium"
              >
                <option value="family">Family (Close Relatives)</option>
                <option value="friends">Friends &amp; Peers</option>
                <option value="colleagues">Colleagues &amp; Office</option>
                <option value="vip">VIP &amp; Dignitaries</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                RSVP Attendance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition font-medium"
              >
                <option value="confirmed">Confirmed (Attending)</option>
                <option value="declined">Declined (Regrets)</option>
                <option value="pending">Awaiting Response (Pending)</option>
              </select>
            </div>
          </div>

          {/* Headcounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Invited Headcount (Pax)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={invitedCount}
                onChange={(e) => setInvitedCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Confirmed Headcount (Pax)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={status !== 'confirmed'}
                value={status === 'confirmed' ? attendingCount : 0}
                onChange={(e) => setAttendingCount(parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-xl border border-neutral-200 transition font-bold ${
                  status === 'confirmed' ? 'bg-white focus:outline-none focus:border-neutral-900 text-neutral-900' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Diet & Arrival (Only if confirmed) */}
          {status === 'confirmed' && (
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Dietary Preparation
                  </label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-neutral-900 transition font-medium"
                  >
                    <option value="veg">Pure Vegetarian 🟢</option>
                    <option value="non-veg">Non-Vegetarian 🔴</option>
                    <option value="jain">Strict Jain (No Root Veg) 🟡</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Expected Arrival Time
                  </label>
                  <select
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-neutral-900 transition font-mono font-medium"
                  >
                    <option value="06:30 PM">06:30 PM (Gates Open)</option>
                    <option value="07:00 PM">07:00 PM</option>
                    <option value="07:30 PM">07:30 PM (Peak Banquet)</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="08:30 PM">08:30 PM</option>
                    <option value="09:00 PM">09:00 PM (Late Dinner)</option>
                  </select>
                </div>
              </div>

              {/* Ceremony Attendance Checkboxes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Ceremony Attendance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'haldi', label: 'Haldi & Mehendi' },
                    { id: 'sangeet', label: 'Sangeet Night' },
                    { id: 'wedding', label: 'Wedding Pheras' },
                    { id: 'reception', label: 'Grand Reception' },
                  ].map((c) => {
                    const active = subEvents[c.id] !== false;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleToggleSubEvent(c.id)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                          active
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                            : 'bg-white text-neutral-600 border-neutral-200 opacity-60'
                        }`}
                      >
                        <span className="text-[11px]">{c.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notes & Special Requests */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Host Notes &amp; Special Requests
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VIP stage seating, hotel parking requested, arriving with elderly parents..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Removing...' : 'Delete Guest'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
