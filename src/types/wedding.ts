export type GuestStatus = 'confirmed' | 'declined' | 'pending';
export type DietPreference = 'veg' | 'non-veg' | 'jain';
export type GuestCategory = 'family' | 'friends' | 'colleagues' | 'vip';
export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'pa';

export interface SubEvent {
  id: string; // 'haldi' | 'sangeet' | 'wedding' | 'reception'
  title: string;
  ceremony: string;
  date: string;
  time: string;
  venue: string;
  mealType: 'Lunch' | 'Dinner' | 'High Tea';
  dressCode: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  category: GuestCategory;
  invitedCount: number;
  status: GuestStatus;
  attendingCount: number;
  diet: DietPreference | null;
  arrivalTime: string | null; // e.g. "07:00 PM"
  songRequest?: string;
  notes?: string;
  lastUpdated?: string;
  magicToken: string;
  subEvents?: Record<string, boolean>; // { haldi: true, sangeet: true, wedding: true, reception: true }
  allowedSubEvents?: string[]; // Ceremonies this family is invited to: e.g. ['reception'] or ['sangeet', 'reception'] or ['haldi', 'sangeet', 'wedding', 'reception']
  tableNumber?: string | null;
}

export interface HotelRoom {
  id: string;
  room_number: string;
  hotel_name: string;
  guest_id: string | null;
  guest_name: string | null;
  status: 'occupied' | 'available';
  check_in: string;
  check_out: string;
}

export interface EventDetails {
  id: string;
  couple: string; // e.g. "Aarav & Riya"
  eventTitle: string; // "Grand Wedding Reception"
  date: string; // e.g. "Saturday, November 28, 2026"
  time: string; // "6:30 PM onwards"
  venue: string; // "The Grand Ballroom, Taj Palace"
  city: string; // "New Delhi, India"
  mapsUrl: string;
  targetInvited: number; // 400
  costPerPlate: number; // in INR, e.g. 2500
  subEvents?: SubEvent[];
}

export interface EventStats {
  totalInvited: number;
  totalResponses: number;
  confirmedGuests: number;
  confirmedParties: number;
  declinedGuests: number;
  declinedParties: number;
  awaitingGuests: number;
  awaitingParties: number;
  vegCount: number;
  nonVegCount: number;
  jainCount: number;
  estimatedCost: number; // totalInvited * costPerPlate
  confirmedCost: number; // confirmedGuests * costPerPlate
  potentialSavings: number; // savings achieved by not over-ordering
  responseRate: number; // percentage
  arrivalDistribution: Record<string, number>; // e.g. { "6:00 PM": 15, "7:00 PM": 85, ... }
  subEventHeadcounts?: Record<string, { totalPax: number; parties: number }>;
}

export interface ActivityEvent {
  id: string;
  guestName: string;
  type: 'rsvp_confirmed' | 'rsvp_declined' | 'guest_added' | 'reminder_sent';
  description: string;
  timestamp: string;
  count?: number;
  diet?: DietPreference | null;
}

export interface WebSocketMessage {
  type: 'INIT' | 'RSVP_UPDATED' | 'GUEST_ADDED' | 'GUEST_UPDATED' | 'EVENT_UPDATED' | 'ROOM_UPDATED' | 'SIMULATION_TICK' | 'RESET' | 'ACTIVITY_ADDED';
  data: any;
  stats?: EventStats;
}
