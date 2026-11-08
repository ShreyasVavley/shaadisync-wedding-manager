import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { initialEventDetails, initialGuests, initialActivities } from './seedData';
import { Guest, EventDetails, ActivityEvent } from '../src/types/wedding';

const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wedding.db');
console.log(`📁 Initializing Persistent SQLite Database at: ${dbPath}`);

export const db = new DatabaseSync(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    couple TEXT NOT NULL,
    event_title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    maps_url TEXT NOT NULL,
    target_invited INTEGER NOT NULL,
    cost_per_plate INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    invited_count INTEGER NOT NULL,
    status TEXT NOT NULL,
    attending_count INTEGER NOT NULL,
    diet TEXT,
    arrival_time TEXT,
    song_request TEXT,
    notes TEXT,
    last_updated TEXT,
    magic_token TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    guest_id TEXT,
    guest_name TEXT,
    status TEXT NOT NULL, -- 'occupied', 'available'
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    guest_name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    count INTEGER,
    diet TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS automations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    schedule_description TEXT NOT NULL,
    last_run_at TEXT,
    total_dispatched INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS webhook_logs (
    id TEXT PRIMARY KEY,
    sender_phone TEXT NOT NULL,
    guest_name TEXT,
    message_content TEXT NOT NULL,
    parsed_action TEXT NOT NULL,
    reply_sent TEXT,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_guests_token ON guests(magic_token);
  CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
`);

// Migration for sub_events and table_number columns
try {
  db.exec("ALTER TABLE guests ADD COLUMN sub_events TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE guests ADD COLUMN table_number TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE guests ADD COLUMN allowed_sub_events TEXT;");
} catch (e) {}

export const DEFAULT_SUB_EVENTS = [
  {
    id: 'haldi',
    title: 'Phoolon Ki Haldi & Mehendi',
    ceremony: 'Haldi & Mehendi',
    date: 'Friday, Nov 27, 2026',
    time: '11:00 AM onwards',
    venue: 'Poolside Lawns, Taj Palace',
    mealType: 'Lunch' as const,
    dressCode: 'Yellow & Floral Festive',
  },
  {
    id: 'sangeet',
    title: 'Sangeet & Cocktail Soirée',
    ceremony: 'Sangeet Night',
    date: 'Friday, Nov 27, 2026',
    time: '7:30 PM onwards',
    venue: 'Shahjehan Ballroom, Taj Palace',
    mealType: 'Dinner' as const,
    dressCode: 'Indo-Western & Glamour',
  },
  {
    id: 'wedding',
    title: 'Varmala & Royal Pheras',
    ceremony: 'Wedding Pheras',
    date: 'Saturday, Nov 28, 2026',
    time: '4:00 PM onwards',
    venue: 'The Mandap Courtyard, Taj Palace',
    mealType: 'High Tea' as const,
    dressCode: 'Traditional Regal Ethnic',
  },
  {
    id: 'reception',
    title: 'Grand Wedding Reception',
    ceremony: 'Reception & Banquet',
    date: 'Saturday, Nov 28, 2026',
    time: '7:30 PM onwards',
    venue: 'The Grand Ballroom, Taj Palace',
    mealType: 'Dinner' as const,
    dressCode: 'Formal Black Tie / Sherwani',
  },
];

// Seed Database if empty
function seedIfEmpty() {
  const eventCheck = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventCheck.count === 0) {
    console.log('🌱 Seeding initial event details into SQLite...');
    const insertEvent = db.prepare(`
      INSERT INTO events (id, couple, event_title, date, time, venue, city, maps_url, target_invited, cost_per_plate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertEvent.run(
      initialEventDetails.id,
      initialEventDetails.couple,
      initialEventDetails.eventTitle,
      initialEventDetails.date,
      initialEventDetails.time,
      initialEventDetails.venue,
      initialEventDetails.city,
      initialEventDetails.mapsUrl,
      initialEventDetails.targetInvited,
      initialEventDetails.costPerPlate
    );
  }

  const guestCheck = db.prepare('SELECT COUNT(*) as count FROM guests').get() as { count: number };
  if (guestCheck.count === 0) {
    console.log('🌱 Seeding initial guests into SQLite...');
    const insertGuest = db.prepare(`
      INSERT INTO guests (id, name, phone, category, invited_count, status, attending_count, diet, arrival_time, song_request, notes, last_updated, magic_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const g of initialGuests) {
      insertGuest.run(
        g.id,
        g.name,
        g.phone,
        g.category,
        g.invitedCount,
        g.status,
        g.attendingCount,
        g.diet || null,
        g.arrivalTime || null,
        g.songRequest || null,
        g.notes || null,
        g.lastUpdated || null,
        g.magicToken
      );
    }
  }

  const roomCheck = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCheck.count === 0) {
    console.log('🌱 Seeding initial hotel room allocations into SQLite...');
    const insertRoom = db.prepare(`
      INSERT INTO rooms (id, room_number, hotel_name, guest_id, guest_name, status, check_in, check_out)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialRooms = [
      { id: 'room-101', room_number: 'Room 101 (Deluxe Suite)', hotel_name: 'Taj Palace', guest_id: 'g-1', guest_name: 'Rajesh & Sunita Sharma', status: 'occupied', check_in: 'Nov 27, 2026', check_out: 'Nov 29, 2026' },
      { id: 'room-102', room_number: 'Room 102 (Executive Suite)', hotel_name: 'Taj Palace', guest_id: 'g-4', guest_name: 'Bhavin & Neha Mehta', status: 'occupied', check_in: 'Nov 28, 2026', check_out: 'Nov 30, 2026' },
      { id: 'room-103', room_number: 'Room 103 (Twin Bed)', hotel_name: 'Taj Palace', guest_id: 'g-3', guest_name: 'Aryan Verma (IIT Gang)', status: 'occupied', check_in: 'Nov 28, 2026', check_out: 'Nov 29, 2026' },
      { id: 'room-104', room_number: 'Room 104 (Presidential Suite)', hotel_name: 'Taj Palace', guest_id: 'g-6', guest_name: 'Gupta Ji & Parivar', status: 'occupied', check_in: 'Nov 27, 2026', check_out: 'Nov 30, 2026' },
      { id: 'room-105', room_number: 'Room 105 (King Room)', hotel_name: 'Taj Palace', guest_id: null, guest_name: null, status: 'available', check_in: 'Nov 28, 2026', check_out: 'Nov 29, 2026' },
      { id: 'room-106', room_number: 'Room 106 (King Room)', hotel_name: 'Taj Palace', guest_id: null, guest_name: null, status: 'available', check_in: 'Nov 28, 2026', check_out: 'Nov 29, 2026' },
      { id: 'room-107', room_number: 'Room 107 (Twin Room)', hotel_name: 'Taj Palace', guest_id: null, guest_name: null, status: 'available', check_in: 'Nov 28, 2026', check_out: 'Nov 29, 2026' },
      { id: 'room-108', room_number: 'Room 108 (Deluxe Suite)', hotel_name: 'Taj Palace', guest_id: null, guest_name: null, status: 'available', check_in: 'Nov 28, 2026', check_out: 'Nov 30, 2026' },
    ];

    for (const r of initialRooms) {
      insertRoom.run(r.id, r.room_number, r.hotel_name, r.guest_id, r.guest_name, r.status, r.check_in, r.check_out);
    }
  }

  const actCheck = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number };
  if (actCheck.count === 0) {
    const insertAct = db.prepare(`
      INSERT INTO activities (id, guest_name, type, description, timestamp, count, diet)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of initialActivities) {
      insertAct.run(a.id, a.guestName, a.type, a.description, a.timestamp, a.count || null, a.diet || null);
    }
  }

  // Seed default automation rules
  const autoCheck = db.prepare('SELECT COUNT(*) as count FROM automations').get() as { count: number };
  if (autoCheck.count === 0) {
    console.log('🤖 Seeding default scheduled messaging automation rules...');
    const insertAuto = db.prepare(`
      INSERT INTO automations (id, name, description, trigger_type, is_enabled, schedule_description, last_run_at, total_dispatched)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultAutomations = [
      {
        id: 'rule_catering_48h',
        name: '48h Banquet Catering Nudge',
        description: 'Auto-dispatches WhatsApp reminder to pending guests 48 hours prior to banquet to freeze catering count and avoid over-ordering.',
        trigger_type: 'catering_48h',
        is_enabled: 1,
        schedule_description: '48 hours prior to wedding reception (T-48h)',
        last_run_at: 'Scheduled for T-48h',
        total_dispatched: 0,
      },
      {
        id: 'rule_day_of_logistics',
        name: 'Day-Of Directions & Gates Opening',
        description: 'Dispatches Taj Palace venue map pin, valet parking details, and gates opening alert (6:30 PM) to confirmed guests.',
        trigger_type: 'day_of_9am',
        is_enabled: 1,
        schedule_description: 'Wedding day morning (09:00 AM)',
        last_run_at: 'Scheduled for Event Morning',
        total_dispatched: 0,
      },
      {
        id: 'rule_inbound_ai_rsvp',
        name: 'Two-Way WhatsApp Inbound Auto-RSVP',
        description: 'Webhook AI listener that parses inbound guest messages ("YES 4 PAX VEG", "NO", "JAIN") and auto-updates database instantly.',
        trigger_type: 'inbound_ai',
        is_enabled: 1,
        schedule_description: 'Continuous realtime webhook listener',
        last_run_at: 'Active (24/7)',
        total_dispatched: 0,
      },
      {
        id: 'rule_instant_invite',
        name: 'Instant Magic Link on Guest Creation',
        description: 'Automatically dispatches personal wedding RSVP magic link via WhatsApp the second a guest is added to the roster.',
        trigger_type: 'instant_invite',
        is_enabled: 1,
        schedule_description: 'Triggered on new guest creation',
        last_run_at: 'Active',
        total_dispatched: 0,
      },
    ];

    for (const auto of defaultAutomations) {
      insertAuto.run(
        auto.id,
        auto.name,
        auto.description,
        auto.trigger_type,
        auto.is_enabled,
        auto.schedule_description,
        auto.last_run_at,
        auto.total_dispatched
      );
    }
  }
}

seedIfEmpty();

// Database Query Helpers
export function getEventDetails(): EventDetails {
  const row = db.prepare('SELECT * FROM events LIMIT 1').get() as any;
  return {
    id: row.id,
    couple: row.couple,
    eventTitle: row.event_title,
    date: row.date,
    time: row.time,
    venue: row.venue,
    city: row.city,
    mapsUrl: row.maps_url,
    targetInvited: Number(row.target_invited),
    costPerPlate: Number(row.cost_per_plate),
    subEvents: DEFAULT_SUB_EVENTS,
  };
}

export function updateEventDetails(data: Partial<EventDetails>): EventDetails {
  const current = getEventDetails();
  const updated = { ...current, ...data };
  db.prepare(`
    UPDATE events SET
      couple = ?, event_title = ?, date = ?, time = ?, venue = ?, city = ?, maps_url = ?, target_invited = ?, cost_per_plate = ?
    WHERE id = ?
  `).run(
    updated.couple,
    updated.eventTitle,
    updated.date,
    updated.time,
    updated.venue,
    updated.city,
    updated.mapsUrl,
    updated.targetInvited,
    updated.costPerPlate,
    current.id
  );
  return { ...updated, subEvents: DEFAULT_SUB_EVENTS };
}

export function resolveAllowedSubEvents(allowedStr: string | null | undefined, category: string): string[] {
  if (allowedStr) {
    try {
      const parsed = JSON.parse(allowedStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  // Authentic Indian wedding guest event segmentation:
  if (category === 'family') {
    return ['haldi', 'sangeet', 'wedding', 'reception'];
  } else if (category === 'friends') {
    return ['sangeet', 'reception'];
  } else if (category === 'colleagues') {
    return ['reception'];
  }
  return ['wedding', 'reception'];
}

export function getAllGuests(): Guest[] {
  const rows = db.prepare('SELECT * FROM guests ORDER BY ROWID DESC').all() as any[];
  return rows.map((r) => {
    let subEvents: Record<string, boolean> | undefined;
    if (r.sub_events) {
      try {
        subEvents = JSON.parse(r.sub_events);
      } catch (e) {}
    }
    const allowedSubEvents = resolveAllowedSubEvents(r.allowed_sub_events, r.category);
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      category: r.category as any,
      invitedCount: Number(r.invited_count),
      status: r.status as any,
      attendingCount: Number(r.attending_count),
      diet: r.diet as any,
      arrivalTime: r.arrival_time,
      songRequest: r.song_request || undefined,
      notes: r.notes || undefined,
      lastUpdated: r.last_updated || undefined,
      magicToken: r.magic_token,
      subEvents,
      allowedSubEvents,
      tableNumber: r.table_number || undefined,
    };
  });
}

export function getGuestByIdOrToken(param: string): Guest | null {
  const row = db.prepare('SELECT * FROM guests WHERE id = ? OR magic_token = ?').get(param, param) as any;
  if (!row) return null;
  let subEvents: Record<string, boolean> | undefined;
  if (row.sub_events) {
    try {
      subEvents = JSON.parse(row.sub_events);
    } catch (e) {}
  }
  const allowedSubEvents = resolveAllowedSubEvents(row.allowed_sub_events, row.category);
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    category: row.category as any,
    invitedCount: Number(row.invited_count),
    status: row.status as any,
    attendingCount: Number(row.attending_count),
    diet: row.diet as any,
    arrivalTime: row.arrival_time,
    songRequest: row.song_request || undefined,
    notes: row.notes || undefined,
    lastUpdated: row.last_updated || undefined,
    magicToken: row.magic_token,
    subEvents,
    allowedSubEvents,
    tableNumber: row.table_number || undefined,
  };
}

export function updateGuestRSVP(
  guestId: string,
  rsvpData: {
    status: 'confirmed' | 'declined';
    attendingCount: number;
    diet: string | null;
    arrivalTime: string | null;
    songRequest?: string;
    notes?: string;
    subEvents?: Record<string, boolean>;
    tableNumber?: string | null;
  }
): Guest {
  const prev = getGuestByIdOrToken(guestId);
  if (!prev) throw new Error('Guest not found');

  // Security: enforce allowedSubEvents boundary so one family event cannot vote in another
  const allowed = prev.allowedSubEvents || resolveAllowedSubEvents(null, prev.category);
  let safeSubEvents: Record<string, boolean> = {};
  if (rsvpData.subEvents) {
    for (const evId of allowed) {
      if (rsvpData.subEvents[evId] !== undefined) {
        safeSubEvents[evId] = !!rsvpData.subEvents[evId];
      } else {
        safeSubEvents[evId] = true;
      }
    }
  } else if (prev.subEvents) {
    safeSubEvents = prev.subEvents;
  } else {
    for (const evId of allowed) {
      safeSubEvents[evId] = true;
    }
  }

  const subEventsStr = JSON.stringify(safeSubEvents);
  const tableNum = rsvpData.tableNumber !== undefined ? rsvpData.tableNumber : (prev.tableNumber || null);

  db.prepare(`
    UPDATE guests SET
      status = ?,
      attending_count = ?,
      diet = ?,
      arrival_time = ?,
      song_request = ?,
      notes = ?,
      sub_events = ?,
      table_number = ?,
      last_updated = ?
    WHERE id = ? OR magic_token = ?
  `).run(
    rsvpData.status,
    rsvpData.status === 'confirmed' ? rsvpData.attendingCount : 0,
    rsvpData.status === 'confirmed' ? rsvpData.diet : null,
    rsvpData.status === 'confirmed' ? rsvpData.arrivalTime : null,
    rsvpData.songRequest || prev.songRequest || null,
    rsvpData.notes || prev.notes || null,
    subEventsStr,
    tableNum,
    'Just now',
    prev.id,
    prev.magicToken
  );

  return getGuestByIdOrToken(prev.id)!;
}

export function createGuest(data: {
  name: string;
  phone: string;
  category: string;
  invitedCount: number;
}): Guest {
  const id = `g-${Date.now()}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
  const magicToken = `${slug}-${Math.floor(100 + Math.random() * 900)}`;

  db.prepare(`
    INSERT INTO guests (id, name, phone, category, invited_count, status, attending_count, diet, arrival_time, last_updated, magic_token)
    VALUES (?, ?, ?, ?, ?, 'pending', 0, NULL, NULL, 'Just now', ?)
  `).run(id, data.name, data.phone, data.category, data.invitedCount, magicToken);

  return getGuestByIdOrToken(id)!;
}

export function getAllActivities(limit = 30): ActivityEvent[] {
  const rows = db.prepare('SELECT * FROM activities ORDER BY ROWID DESC LIMIT ?').all(limit) as any[];
  return rows.map((r) => ({
    id: r.id,
    guestName: r.guest_name,
    type: r.type as any,
    description: r.description,
    timestamp: r.timestamp,
    count: r.count != null ? Number(r.count) : undefined,
    diet: r.diet as any,
  }));
}

export function recordActivity(act: ActivityEvent) {
  db.prepare(`
    INSERT INTO activities (id, guest_name, type, description, timestamp, count, diet)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(act.id, act.guestName, act.type, act.description, act.timestamp, act.count || null, act.diet || null);
}

export function getAllRooms(): any[] {
  return db.prepare('SELECT * FROM rooms ORDER BY room_number ASC').all() as any[];
}

export function assignRoom(roomId: string, guestId: string | null, guestName: string | null) {
  const status = guestId ? 'occupied' : 'available';
  db.prepare(`
    UPDATE rooms SET guest_id = ?, guest_name = ?, status = ? WHERE id = ?
  `).run(guestId, guestName, status, roomId);
  return db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
}

export function resetDatabase() {
  db.exec(`
    DELETE FROM events;
    DELETE FROM guests;
    DELETE FROM rooms;
    DELETE FROM activities;
    DELETE FROM automations;
    DELETE FROM webhook_logs;
  `);
  seedIfEmpty();
}

// Automation helpers
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_enabled: number;
  schedule_description: string;
  last_run_at: string;
  total_dispatched: number;
}

export function getAllAutomations(): AutomationRule[] {
  return db.prepare('SELECT * FROM automations ORDER BY ROWID ASC').all() as AutomationRule[];
}

export function toggleAutomation(id: string, isEnabled: boolean) {
  db.prepare('UPDATE automations SET is_enabled = ? WHERE id = ?').run(isEnabled ? 1 : 0, id);
  return db.prepare('SELECT * FROM automations WHERE id = ?').get(id) as AutomationRule;
}

export function updateAutomationLastRun(id: string, dispatchedCount: number) {
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Today';
  db.prepare(`
    UPDATE automations
    SET last_run_at = ?, total_dispatched = total_dispatched + ?
    WHERE id = ?
  `).run(now, dispatchedCount, id);
}

// Webhook log helpers
export interface WebhookLog {
  id: string;
  sender_phone: string;
  guest_name: string | null;
  message_content: string;
  parsed_action: string;
  reply_sent: string | null;
  status: string;
  timestamp: string;
}

export function recordWebhookLog(log: Omit<WebhookLog, 'id' | 'timestamp'>) {
  const id = `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Just now';
  db.prepare(`
    INSERT INTO webhook_logs (id, sender_phone, guest_name, message_content, parsed_action, reply_sent, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    log.sender_phone,
    log.guest_name,
    log.message_content,
    log.parsed_action,
    log.reply_sent,
    log.status,
    timestamp
  );
  return { id, timestamp, ...log };
}

export function getAllWebhookLogs(limit = 40): WebhookLog[] {
  return db.prepare('SELECT * FROM webhook_logs ORDER BY ROWID DESC LIMIT ?').all(limit) as WebhookLog[];
}

// System configuration (Meta WhatsApp API credentials)
export function getSystemConfig(key: string, defaultValue = ''): string {
  const row = db.prepare('SELECT value FROM system_config WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : defaultValue;
}

export function setSystemConfig(key: string, value: string) {
  db.prepare(`
    INSERT INTO system_config (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

// Host Admin Passcode Security helpers
export function getAdminPasscode(): string {
  return process.env.ADMIN_PASSCODE || getSystemConfig('ADMIN_PASSCODE', '2026');
}

export function setAdminPasscode(newPin: string): void {
  setSystemConfig('ADMIN_PASSCODE', newPin);
}
