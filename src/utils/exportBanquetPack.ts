import type { EventDetails, EventStats, Guest, HotelRoom } from '../types/wedding';

export function exportBanquetMasterCSV(
  event: EventDetails,
  stats: EventStats,
  guests: Guest[],
  rooms: HotelRoom[] = []
) {
  const lines: string[] = [];

  // Helper to escape CSV values
  const escape = (val: any) => {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Section 1: Executive Overview
  lines.push('========================================================================');
  lines.push(`OFFICIAL BANQUET & CATERING MASTER PACK - ${event.couple.toUpperCase()}`);
  lines.push(`Venue: ${event.venue}, ${event.city}`);
  lines.push(`Generated: ${new Date().toLocaleString('en-IN')}`);
  lines.push('========================================================================\n');

  lines.push('1. BANQUET GUARANTEE & FINANCIAL SUMMARY');
  lines.push(['Metric', 'Count / Value', 'Notes'].map(escape).join(','));
  lines.push(['Total Invited Headcount', stats.totalInvited, 'Total invited on master list'].map(escape).join(','));
  lines.push(['Confirmed Headcount', stats.confirmedGuests, 'Definite attendees committing plates'].map(escape).join(','));
  lines.push(['Confirmed Parties', stats.confirmedParties, 'Families confirmed'].map(escape).join(','));
  lines.push(['Declined Headcount', stats.declinedGuests, 'Released plates'].map(escape).join(','));
  lines.push(['Awaiting RSVP', stats.awaitingGuests, 'Unconfirmed headcounts'].map(escape).join(','));
  lines.push(['Cost Per Plate', `INR ${event.costPerPlate.toLocaleString('en-IN')}`, 'Contracted banquet rate'].map(escape).join(','));
  lines.push(['Committed Catering Spend', `INR ${stats.confirmedCost.toLocaleString('en-IN')}`, 'Guaranteed minimum billing'].map(escape).join(','));
  lines.push(['Net Food Wastage Savings', `INR ${stats.potentialSavings.toLocaleString('en-IN')}`, 'Saved from unconfirmed plates'].map(escape).join(','));
  lines.push(['Overall RSVP Response Rate', `${stats.responseRate}%`, 'Completed responses'].map(escape).join(','));
  lines.push('\n');

  // Section 2: Dietary Kitchen Prep Lines
  lines.push('2. KITCHEN PREPARATION RATIO');
  lines.push(['Dietary Category', 'Guaranteed Pax', 'Percentage', 'Preparation Guidelines'].map(escape).join(','));
  const vegPct = stats.confirmedGuests > 0 ? Math.round((stats.vegCount / stats.confirmedGuests) * 100) : 0;
  const nonVegPct = stats.confirmedGuests > 0 ? Math.round((stats.nonVegCount / stats.confirmedGuests) * 100) : 0;
  const jainPct = stats.confirmedGuests > 0 ? Math.round((stats.jainCount / stats.confirmedGuests) * 100) : 0;
  lines.push(['Pure Vegetarian', stats.vegCount, `${vegPct}%`, 'Dedicated veg cooking line & fryers'].map(escape).join(','));
  lines.push(['Non-Vegetarian', stats.nonVegCount, `${nonVegPct}%`, 'Kebabs, Curries, Biryani stations'].map(escape).join(','));
  lines.push(['Strict Jain', stats.jainCount, `${jainPct}%`, 'Strictly zero root vegetables, onion, or garlic'].map(escape).join(','));
  lines.push('\n');

  // Section 3: Raw Food Saved from Wastage
  const paneerKg = Math.round(stats.declinedGuests * 0.18);
  const meatKg = Math.round(stats.declinedGuests * 0.22);
  const riceKg = Math.round(stats.declinedGuests * 0.12);
  const sweetsPcs = Math.round(stats.declinedGuests * 2.5);
  lines.push('3. ESTIMATED RAW INGREDIENTS SAVED FROM OVER-ORDERING');
  lines.push(['Ingredient', 'Approx Amount Saved', 'Impact'].map(escape).join(','));
  lines.push(['Fresh Paneer', `~${paneerKg} kg`, 'Not dumped in trash'].map(escape).join(','));
  lines.push(['Meat & Chicken', `~${meatKg} kg`, 'Kitchen prep optimized'].map(escape).join(','));
  lines.push(['Basmati Rice', `~${riceKg} kg`, 'Buffer controlled'].map(escape).join(','));
  lines.push(['Desserts & Mithai', `~${sweetsPcs} pcs`, 'Eliminated excess'].map(escape).join(','));
  lines.push('\n');

  // Section 4: Hotel Room Allocation
  if (rooms.length > 0) {
    lines.push('4. HOTEL ROOM ALLOCATIONS (TAJ PALACE)');
    lines.push(['Room Number', 'Hotel', 'Assigned Family', 'Status', 'Check-In', 'Check-Out'].map(escape).join(','));
    for (const r of rooms) {
      lines.push([r.room_number, r.hotel_name, r.guest_name || 'Vacant', r.status.toUpperCase(), r.check_in, r.check_out].map(escape).join(','));
    }
    lines.push('\n');
  }

  // Section 5: Master Guest Roster
  lines.push('5. COMPLETE GUEST ROSTER & RSVP REGISTRATION');
  lines.push([
    'Guest / Family Name',
    'Phone',
    'Category',
    'Status',
    'Invited Pax',
    'Confirmed Pax',
    'Diet Preference',
    'Expected Arrival',
    'Assigned Room',
    'Song Request',
    'Notes / Blessings',
    'Personal Magic Link',
  ].map(escape).join(','));

  for (const g of guests) {
    const assignedRoom = rooms.find((r) => r.guest_id === g.id);
    const magicLink = `${window.location.origin}?guest=${g.magicToken}`;
    lines.push([
      g.name,
      g.phone,
      g.category,
      g.status.toUpperCase(),
      g.invitedCount,
      g.attendingCount,
      g.diet ? g.diet.toUpperCase() : 'N/A',
      g.arrivalTime || 'N/A',
      assignedRoom ? assignedRoom.room_number : 'None',
      g.songRequest || '',
      g.notes || '',
      magicLink,
    ].map(escape).join(','));
  }

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `ShaadiSync_Banquet_Pack_${event.couple.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
