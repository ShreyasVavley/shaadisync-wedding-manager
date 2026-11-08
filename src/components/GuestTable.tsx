import React, { useState } from 'react';
import type { Guest } from '../types/wedding';
import {
  Search,
  ExternalLink,
  MessageSquare,
  Check,
  Copy,
  UserCheck,
  UserX,
  Clock,
  Filter,
  Send,
  X,
} from 'lucide-react';

interface GuestTableProps {
  guests: Guest[];
  onSelectGuestForPreview: (guest: Guest) => void;
  onOpenWhatsAppModal: (guest: Guest) => void;
  onOpenBatchNotificationModal: (selectedGuests: Guest[]) => void;
}

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  onSelectGuestForPreview,
  onOpenWhatsAppModal,
  onOpenBatchNotificationModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedBulk, setCopiedBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      (g.notes && g.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesDiet = dietFilter === 'all' || g.diet === dietFilter;

    return matchesSearch && matchesStatus && matchesDiet;
  });

  const isAllSelected =
    filteredGuests.length > 0 && filteredGuests.every((g) => selectedIds.has(g.id));
  const isIndeterminate =
    filteredGuests.some((g) => selectedIds.has(g.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  const handleToggleGuest = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectPending = () => {
    const pending = guests.filter((g) => g.status === 'pending');
    setSelectedIds(new Set(pending.map((g) => g.id)));
    setStatusFilter('pending');
  };

  const handleSelectConfirmed = () => {
    const confirmed = guests.filter((g) => g.status === 'confirmed');
    setSelectedIds(new Set(confirmed.map((g) => g.id)));
    setStatusFilter('confirmed');
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const copyMagicLink = (guest: Guest) => {
    const link = `${window.location.origin}?guest=${guest.magicToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySelectedLinks = () => {
    const selected = guests.filter((g) => selectedIds.has(g.id));
    const lines = selected.map(
      (g) => `${g.name} (${g.phone}): ${window.location.origin}?guest=${g.magicToken}`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedBulk(true);
    setTimeout(() => setCopiedBulk(false), 2000);
  };

  const selectedGuestsList = guests.filter((g) => selectedIds.has(g.id));
  const selectedTotalPax = selectedGuestsList.reduce((acc, g) => acc + g.invitedCount, 0);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden relative">
      {/* Controls Bar */}
      <div className="p-4 border-b border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by guest name, phone, or notes..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/60 focus:bg-white focus:outline-none focus:border-neutral-900 transition"
            />
          </div>

          {/* Quick Selection Presets & Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isAllSelected
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={handleToggleSelectAll}
                className="rounded border-neutral-300 text-neutral-950 focus:ring-0 cursor-pointer pointer-events-none"
              />
              <span>Select All ({filteredGuests.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSelectPending}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5"
              title="Select all guests who have not responded to send them a reminder"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Select Awaiting ({guests.filter((g) => g.status === 'pending').length})</span>
            </button>

            <button
              type="button"
              onClick={handleSelectConfirmed}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5"
              title="Select all confirmed guests to send them wedding day gate & timing reminders"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Confirmed ({guests.filter((g) => g.status === 'confirmed').length})</span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition"
              >
                Clear ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-neutral-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {(['all', 'confirmed', 'pending', 'declined'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st === 'pending' ? 'Awaiting Response' : st}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-neutral-200 mx-1 hidden sm:block" />

          {(['all', 'veg', 'non-veg', 'jain'] as const).map((dt) => (
            <button
              key={dt}
              onClick={() => setDietFilter(dt)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                dietFilter === dt
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {dt === 'all' ? 'All Diets' : dt}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Banner When Multiple Guests Selected */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 bg-neutral-950 text-white border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <div className="text-xs">
              <span className="font-extrabold text-white text-sm">
                {selectedIds.size} {selectedIds.size === 1 ? 'Party' : 'Parties'} Selected
              </span>{' '}
              <span className="text-neutral-400 font-medium">
                ({selectedTotalPax} total invited headcount)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy selected magic links */}
            <button
              type="button"
              onClick={handleCopySelectedLinks}
              className="px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition"
            >
              {copiedBulk ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>{copiedBulk ? 'Copied Links!' : 'Copy Links'}</span>
            </button>

            {/* Send WhatsApp / Notification Button */}
            <button
              type="button"
              onClick={() => onOpenBatchNotificationModal(selectedGuestsList)}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp / Notification to Selected ({selectedIds.size})</span>
            </button>

            {/* Clear button */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 text-[10px] uppercase font-bold tracking-wider text-neutral-400 border-b border-neutral-200/80">
            <tr>
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleToggleSelectAll}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                  title="Select / Deselect All Filtered"
                />
              </th>
              <th className="py-3 px-3">Guest / Family</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Confirmed Headcount</th>
              <th className="py-3 px-3">Diet Prep</th>
              <th className="py-3 px-3">Expected Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-400">
                  No matching guests found.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => {
                const isConfirmed = guest.status === 'confirmed';
                const isDeclined = guest.status === 'declined';
                const isPending = guest.status === 'pending';
                const isSelected = selectedIds.has(guest.id);

                return (
                  <tr
                    key={guest.id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-amber-50/60 font-medium'
                        : 'hover:bg-neutral-50/60'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleGuest(guest.id)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                      />
                    </td>

                    {/* Name & Phone */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-neutral-900 flex items-center gap-2">
                        <span>{guest.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{guest.phone}</span>
                        {guest.songRequest && (
                          <span className="text-neutral-500 italic bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 font-sans text-[10px]">
                            🎵 {guest.songRequest}
                          </span>
                        )}
                      </div>
                      {guest.notes && (
                        <div className="text-[11px] text-neutral-500 italic mt-0.5">
                          "{guest.notes}"
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                        {guest.category}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3.5 h-3.5" />
                          Confirmed
                        </span>
                      )}
                      {isDeclined && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <UserX className="w-3.5 h-3.5" />
                          Declined
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting
                        </span>
                      )}
                    </td>

                    {/* Headcount */}
                    <td className="py-3.5 px-3 font-medium">
                      {isConfirmed ? (
                        <span className="text-neutral-900 font-bold">
                          {guest.attendingCount}{' '}
                          <span className="text-neutral-400 font-normal">
                            (of {guest.invitedCount} invited)
                          </span>
                        </span>
                      ) : isDeclined ? (
                        <span className="text-neutral-400">0 Attending</span>
                      ) : (
                        <span className="text-neutral-500">
                          {guest.invitedCount} Invited (Pending)
                        </span>
                      )}
                    </td>

                    {/* Diet Prep */}
                    <td className="py-3.5 px-3">
                      {isConfirmed && guest.diet ? (
                        <div className="flex items-center gap-1.5">
                          {guest.diet === 'veg' && <span className="veg-badge" />}
                          {guest.diet === 'non-veg' && <span className="non-veg-badge" />}
                          {guest.diet === 'jain' && <span className="jain-badge" />}
                          <span className="capitalize font-semibold text-neutral-800 text-[11px]">
                            {guest.diet === 'veg' ? 'Veg' : guest.diet === 'non-veg' ? 'Non-Veg' : 'Jain'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>

                    {/* Arrival Time */}
                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      {isConfirmed && guest.arrivalTime ? (
                        <span className="font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                          {guest.arrivalTime}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Magic Link */}
                        <button
                          type="button"
                          onClick={() => copyMagicLink(guest)}
                          title="Copy personalized RSVP Link"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                        >
                          {copiedId === guest.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* WhatsApp Invite / Nudge */}
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppModal(guest)}
                          title="Send WhatsApp Invite or Reminder"
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in Mobile RSVP Preview */}
                        <button
                          type="button"
                          onClick={() => onSelectGuestForPreview(guest)}
                          title="Open Guest RSVP Screen"
                          className="p-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
