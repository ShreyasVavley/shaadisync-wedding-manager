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
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-900 text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Out-of-Town Guest &amp; Hotel Room Manager
            </h3>
            <p className="text-xs text-neutral-500">
              Manage barati rooms, suites, and hospitality at Taj Palace
            </p>
          </div>
        </div>

        {/* Room Status Pills */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {occupiedCount} Rooms Allocated
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
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
                  ? 'bg-neutral-50/70 border-neutral-300 shadow-sm'
                  : 'bg-white border-dashed border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-2 rounded-xl ${
                      isOccupied ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{room.room_number}</h4>
                    <span className="text-[10px] text-neutral-400">{room.hotel_name}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOccupied
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {isOccupied ? 'Allocated' : 'Vacant'}
                </span>
              </div>

              {/* Guest Assigned */}
              <div className="mt-3 pt-3 border-t border-neutral-200/60 space-y-1">
                {isOccupied && room.guest_name ? (
                  <>
                    <div className="text-xs font-extrabold text-neutral-900 truncate flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <span>{room.guest_name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      📅 {room.check_in} — {room.check_out}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-neutral-400 italic">No family assigned yet</div>
                )}
              </div>

              {/* Action */}
              <div className="mt-3 pt-2">
                {selectedRoomId === room.id ? (
                  <div className="space-y-2">
                    <select
                      value={selectedGuestId}
                      onChange={(e) => setSelectedGuestId(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 focus:outline-none"
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
                        className="flex-1 py-1 bg-neutral-950 text-white text-[11px] font-bold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setSelectedRoomId(null)}
                        className="px-2 py-1 bg-neutral-200 text-neutral-700 text-[11px] font-semibold rounded-lg"
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
                    className="w-full py-1.5 rounded-xl text-[11px] font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition"
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
