import React, { useState } from 'react';
import type { HotelRoom, Guest } from '../types/wedding';
import { BedDouble, Building2, Users } from 'lucide-react';

interface HotelRoomManagerProps {
  rooms: HotelRoom[];
  guests: Guest[];
  onAssignRoom: (roomId: string, guestId: string | null, guestName: string | null) => Promise<void>;
}

export const HotelRoomManager: React.FC<HotelRoomManagerProps> = ({
  rooms,
  guests,
  onAssignRoom,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');

  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const availableCount = rooms.length - occupiedCount;
  const confirmedGuests = guests.filter((g) => g.status === 'confirmed');

  const handleAssign = async (roomId: string) => {
    if (!selectedGuestId) {
      // Clear assignment
      await onAssignRoom(roomId, null, null);
    } else {
      const guest = guests.find((g) => g.id === selectedGuestId);
      if (guest) {
        await onAssignRoom(roomId, guest.id, guest.name);
      }
    }
    setSelectedRoomId(null);
    setSelectedGuestId('');
  };

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              PALACE HOSPITALITY &amp; HAVELI SUITES
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Out-of-Town Guest &amp; Hotel Room Manager
            </h3>
            <p className="text-xs text-neutral-400">
              Manage barati rooms, luxury heritage suites, and keys at Taj Palace.
            </p>
          </div>
        </div>

        {/* Room Status Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 shadow-sm">
            {occupiedCount} Rooms Allocated
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-950/50 text-amber-300 border border-amber-500/40 shadow-sm">
            {availableCount} Rooms Available
          </span>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.map((room) => {
          const isOccupied = room.status === 'occupied';

          return (
            <div
              key={room.id}
              className={`p-4 rounded-2xl border transition-all ${
                isOccupied
                  ? 'bg-neutral-900/90 border-amber-500/30 shadow-lg'
                  : 'bg-neutral-950/60 border-dashed border-neutral-800 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-2 rounded-xl ${
                      isOccupied ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white font-mono">{room.room_number}</h4>
                    <span className="text-[10px] text-neutral-400">{room.hotel_name}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOccupied
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {isOccupied ? 'Allocated' : 'Vacant'}
                </span>
              </div>

              {/* Guest Assigned */}
              <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1">
                {isOccupied && room.guest_name ? (
                  <>
                    <div className="text-xs font-bold text-amber-300 truncate flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{room.guest_name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      📅 {room.check_in} — {room.check_out}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-neutral-500 italic">No family assigned yet</div>
                )}
              </div>

              {/* Action */}
              <div className="mt-3 pt-2">
                {selectedRoomId === room.id ? (
                  <div className="space-y-2">
                    <select
                      value={selectedGuestId}
                      onChange={(e) => setSelectedGuestId(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- Remove / Vacant --</option>
                      {confirmedGuests.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.attendingCount} guests)
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssign(room.id)}
                        className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setSelectedRoomId(null)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setSelectedGuestId(room.guest_id || '');
                    }}
                    className="w-full py-2 rounded-xl text-[11px] font-bold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 hover:border-amber-500/30 transition"
                  >
                    {isOccupied ? 'Change Assignment' : 'Assign Family'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
