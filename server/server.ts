import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  getEventDetails,
  updateEventDetails,
  getAllGuests,
  getGuestByIdOrToken,
  updateGuestRSVP,
  createGuest,
  getAllActivities,
  recordActivity,
  getAllRooms,
  assignRoom,
  resetDatabase,
  getAllAutomations,
  toggleAutomation,
  getAllWebhookLogs,
  getSystemConfig,
  setSystemConfig,
} from './db';
import { sendWhatsAppMessage, handleInboundWhatsAppWebhook } from './whatsapp';
import { executeAutomationRule, startAutomationScheduler } from './automation';
import { Guest, EventStats, ActivityEvent } from '../src/types/wedding';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

// Helper: Calculate live stats directly from SQLite database
function computeStats(): EventStats {
  const eventDetails = getEventDetails();
  const guests = getAllGuests();

  let confirmedGuests = 0;
  let confirmedParties = 0;
  let declinedGuests = 0;
  let declinedParties = 0;
  let awaitingGuests = 0;
  let awaitingParties = 0;
  let vegCount = 0;
  let nonVegCount = 0;
  let jainCount = 0;

  const arrivalDistribution: Record<string, number> = {
    '06:30 PM': 0,
    '07:00 PM': 0,
    '07:30 PM': 0,
    '08:00 PM': 0,
    '08:30 PM': 0,
    '09:00 PM': 0,
    '09:30 PM': 0,
  };

  const subEventHeadcounts: Record<string, { totalPax: number; parties: number }> = {
    haldi: { totalPax: 0, parties: 0 },
    sangeet: { totalPax: 0, parties: 0 },
    wedding: { totalPax: 0, parties: 0 },
    reception: { totalPax: 0, parties: 0 },
  };

  guests.forEach((g) => {
    if (g.status === 'confirmed') {
      confirmedGuests += g.attendingCount;
      confirmedParties += 1;
      if (g.diet === 'veg') vegCount += g.attendingCount;
      else if (g.diet === 'non-veg') nonVegCount += g.attendingCount;
      else if (g.diet === 'jain') jainCount += g.attendingCount;

      if (g.arrivalTime) {
        arrivalDistribution[g.arrivalTime] = (arrivalDistribution[g.arrivalTime] || 0) + g.attendingCount;
      }

      // Track sub-events attendance
      const sub = g.subEvents || { haldi: true, sangeet: true, wedding: true, reception: true };
      for (const key of ['haldi', 'sangeet', 'wedding', 'reception']) {
        if (sub[key] !== false) {
          subEventHeadcounts[key].totalPax += g.attendingCount;
          subEventHeadcounts[key].parties += 1;
        }
      }
    } else if (g.status === 'declined') {
      declinedGuests += g.invitedCount;
      declinedParties += 1;
    } else {
      awaitingGuests += g.invitedCount;
      awaitingParties += 1;
    }
  });

  const totalInvited = guests.reduce((acc, g) => acc + g.invitedCount, 0);
  const totalResponses = confirmedParties + declinedParties;
  const responseRate = guests.length > 0 ? Math.round((totalResponses / guests.length) * 100) : 0;
  const estimatedCost = totalInvited * eventDetails.costPerPlate;
  const confirmedCost = confirmedGuests * eventDetails.costPerPlate;
  const potentialSavings = declinedGuests * eventDetails.costPerPlate;

  return {
    totalInvited,
    totalResponses,
    confirmedGuests,
    confirmedParties,
    declinedGuests,
    declinedParties,
    awaitingGuests,
    awaitingParties,
    vegCount,
    nonVegCount,
    jainCount,
    estimatedCost,
    confirmedCost,
    potentialSavings,
    responseRate,
    arrivalDistribution,
    subEventHeadcounts,
  };
}

// WebSocket broadcast helper
function broadcast(type: string, data: any) {
  const payload = JSON.stringify({
    type,
    data,
    stats: computeStats(),
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('⚡ Realtime WebSocket client connected');
  ws.send(
    JSON.stringify({
      type: 'INIT',
      data: {
        event: getEventDetails(),
        guests: getAllGuests(),
        activities: getAllActivities(20),
        rooms: getAllRooms(),
      },
      stats: computeStats(),
      timestamp: new Date().toISOString(),
    })
  );

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (e) {
      console.error('Invalid WS message', e);
    }
  });
});

// REST Endpoints
app.get('/api/event', (req, res) => {
  res.json({
    event: getEventDetails(),
    stats: computeStats(),
    activities: getAllActivities(15),
    rooms: getAllRooms(),
  });
});

app.get('/api/guests', (req, res) => {
  res.json(getAllGuests());
});

app.get('/api/guest/:idOrToken', (req, res) => {
  const param = req.params.idOrToken;
  const guest = getGuestByIdOrToken(param);
  if (!guest) {
    return res.status(404).json({ error: 'Guest invitation not found' });
  }
  res.json({ guest, event: getEventDetails() });
});

// Submit / Update RSVP (Persisted to SQLite + Live WS Broadcast)
app.post('/api/rsvp', (req, res) => {
  const { guestId, status, attendingCount, diet, arrivalTime, songRequest, notes, subEvents, tableNumber } = req.body;

  try {
    const updatedGuest = updateGuestRSVP(guestId, {
      status,
      attendingCount: Number(attendingCount) || 1,
      diet,
      arrivalTime,
      songRequest,
      notes,
      subEvents,
      tableNumber,
    });

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: updatedGuest.name,
      type: status === 'confirmed' ? 'rsvp_confirmed' : 'rsvp_declined',
      description:
        status === 'confirmed'
          ? `Confirmed ${updatedGuest.attendingCount} guests (${updatedGuest.diet?.toUpperCase()}, ${updatedGuest.arrivalTime || 'Time TBD'})`
          : `Declined invitation (${updatedGuest.notes ? `"${updatedGuest.notes}"` : 'Cannot attend'})`,
      timestamp: 'Just now',
      count: updatedGuest.attendingCount,
      diet: updatedGuest.diet,
    };

    recordActivity(newActivity);

    // Broadcast in realtime to all clients
    broadcast('RSVP_UPDATED', {
      guest: updatedGuest,
      activity: newActivity,
    });

    res.json({ success: true, guest: updatedGuest, stats: computeStats() });
  } catch (err: any) {
    console.error('Error updating RSVP:', err);
    res.status(500).json({ error: err.message || 'Failed to update RSVP' });
  }
});

// Add single guest (Persisted to SQLite + Live WS Broadcast)
app.post('/api/guest', (req, res) => {
  const { name, phone, category, invitedCount } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const newGuest = createGuest({
    name,
    phone,
    category: category || 'family',
    invitedCount: Number(invitedCount) || 2,
  });

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    guestName: newGuest.name,
    type: 'guest_added',
    description: `Added to guest list (${newGuest.invitedCount} invites, ${newGuest.category})`,
    timestamp: 'Just now',
  };

  recordActivity(newActivity);
  broadcast('GUEST_ADDED', { guest: newGuest, activity: newActivity });

  res.json({ success: true, guest: newGuest, stats: computeStats() });
});

// Batch notification dispatch (WhatsApp reminders / nudges)
app.post('/api/notify-batch', (req, res) => {
  const { guestIds, templateTitle } = req.body;
  const count = Array.isArray(guestIds) ? guestIds.length : 0;

  const title = templateTitle || 'WhatsApp RSVP Reminder';
  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    guestName: `${count} Selected Guests`,
    type: 'reminder_sent',
    description: `Dispatched "${title}" to ${count} guest parties via WhatsApp Automation`,
    timestamp: 'Just now',
  };

  recordActivity(newActivity);
  broadcast('ACTIVITY_ADDED', { activity: newActivity });

  res.json({ success: true, count, activity: newActivity, stats: computeStats() });
});

// Update event details (Persisted to SQLite)
app.post('/api/event', (req, res) => {
  const updated = updateEventDetails(req.body);
  broadcast('EVENT_UPDATED', { event: updated });
  res.json({ success: true, event: updated, stats: computeStats() });
});

// Hotel Rooms
app.get('/api/rooms', (req, res) => {
  res.json(getAllRooms());
});

app.post('/api/rooms/assign', (req, res) => {
  const { roomId, guestId, guestName } = req.body;
  const updatedRoom = assignRoom(roomId, guestId || null, guestName || null);
  broadcast('ROOM_UPDATED', { room: updatedRoom, rooms: getAllRooms() });
  res.json({ success: true, room: updatedRoom, rooms: getAllRooms() });
});

// Export Guest List as CSV
app.get('/api/export-csv', (req, res) => {
  const guests = getAllGuests();
  let csv = 'Name,Phone,Category,Invited Count,Status,Confirmed Count,Diet,Arrival Time,Song Request,Notes\n';

  for (const g of guests) {
    const row = [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.phone}"`,
      `"${g.category}"`,
      g.invitedCount,
      `"${g.status}"`,
      g.attendingCount,
      `"${g.diet || ''}"`,
      `"${g.arrivalTime || ''}"`,
      `"${(g.songRequest || '').replace(/"/g, '""')}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ];
    csv += row.join(',') + '\n';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="wedding_guest_roster.csv"');
  res.send(csv);
});

// Simulate Live RSVP (Picks a pending guest and saves to SQLite)
app.post('/api/simulate', (req, res) => {
  const guests = getAllGuests();
  const pendingGuests = guests.filter((g) => g.status === 'pending');
  let targetGuest: Guest;

  if (pendingGuests.length > 0) {
    targetGuest = pendingGuests[Math.floor(Math.random() * pendingGuests.length)];
  } else {
    targetGuest = guests[Math.floor(Math.random() * guests.length)];
  }

  const isConfirmed = Math.random() > 0.2; // 80% confirm
  const diets: ('veg' | 'non-veg' | 'jain')[] = ['veg', 'veg', 'non-veg', 'jain'];
  const times = ['07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'];
  const songs = ['Kala Chashma', 'London Thumakda', 'Gallan Goodiyaan', 'Sauda Khara Khara', 'Tauba Tauba'];

  const selectedDiet = diets[Math.floor(Math.random() * diets.length)];
  const selectedTime = times[Math.floor(Math.random() * times.length)];
  const selectedSong = songs[Math.floor(Math.random() * songs.length)];

  const updatedGuest = updateGuestRSVP(targetGuest.id, {
    status: isConfirmed ? 'confirmed' : 'declined',
    attendingCount: isConfirmed ? targetGuest.invitedCount : 0,
    diet: isConfirmed ? selectedDiet : null,
    arrivalTime: isConfirmed ? selectedTime : null,
    songRequest: isConfirmed ? selectedSong : undefined,
    notes: isConfirmed ? 'Looking forward to the celebration!' : 'Sending best wishes from afar!',
  });

  const activity: ActivityEvent = {
    id: `act-${Date.now()}`,
    guestName: updatedGuest.name,
    type: isConfirmed ? 'rsvp_confirmed' : 'rsvp_declined',
    description: isConfirmed
      ? `Confirmed ${updatedGuest.attendingCount} guests (${selectedDiet.toUpperCase()}, ${selectedTime})`
      : `Declined ("Sending best wishes from afar!")`,
    timestamp: 'Just now',
    count: updatedGuest.attendingCount,
    diet: updatedGuest.diet,
  };

  recordActivity(activity);
  broadcast('RSVP_UPDATED', { guest: updatedGuest, activity });

  res.json({ success: true, guest: updatedGuest, stats: computeStats() });
});

// Reset database to initial seed data
app.post('/api/reset', (req, res) => {
  resetDatabase();
  broadcast('RESET', {
    event: getEventDetails(),
    guests: getAllGuests(),
    activities: getAllActivities(20),
    rooms: getAllRooms(),
  });
  res.json({ success: true, stats: computeStats() });
});

// Automation Rules Management
app.get('/api/automations', (req, res) => {
  res.json(getAllAutomations());
});

app.post('/api/automations/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;
  const updated = toggleAutomation(id, !!isEnabled);
  res.json({ success: true, automation: updated });
});

app.post('/api/automations/:id/trigger', async (req, res) => {
  const { id } = req.params;
  const result = await executeAutomationRule(id, broadcast);
  res.json({ ...result, stats: computeStats() });
});

// WhatsApp Webhook (Meta Graph API Verification Handshake)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || getSystemConfig('META_WEBHOOK_VERIFY_TOKEN', 'shaadi_sync_verify_123');

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ Meta WhatsApp Webhook Verified successfully');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// WhatsApp Webhook (Meta Inbound Message Receiver)
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromPhone = message.from;
        const textBody = message.text?.body;
        console.log(`📩 Incoming WhatsApp from ${fromPhone}: "${textBody}"`);

        await handleInboundWhatsAppWebhook(fromPhone, textBody, broadcast);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error handling WhatsApp webhook:', err);
    res.sendStatus(500);
  }
});

// Simulation endpoint for UI testing of inbound WhatsApp messages
app.post('/api/webhook/whatsapp/simulate', async (req, res) => {
  const { senderPhone, messageText } = req.body;
  if (!senderPhone || !messageText) {
    return res.status(400).json({ error: 'senderPhone and messageText are required' });
  }

  const result = await handleInboundWhatsAppWebhook(senderPhone, messageText, broadcast);
  res.json({
    success: true,
    reply: result.replyText,
    guest: result.guest,
    stats: computeStats(),
    logs: getAllWebhookLogs(10),
  });
});

// Webhook logs
app.get('/api/webhook/logs', (req, res) => {
  res.json(getAllWebhookLogs(30));
});

// System config (Meta WhatsApp Cloud API credentials)
app.get('/api/config', (req, res) => {
  const token = process.env.META_WHATSAPP_TOKEN || getSystemConfig('META_WHATSAPP_TOKEN');
  const phoneId = process.env.META_PHONE_NUMBER_ID || getSystemConfig('META_PHONE_NUMBER_ID');
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || getSystemConfig('META_WEBHOOK_VERIFY_TOKEN', 'shaadi_sync_verify_123');

  res.json({
    hasToken: !!token,
    phoneId: phoneId || '',
    verifyToken,
    webhookUrl: `${req.protocol}://${req.get('host')}/api/webhook/whatsapp`,
  });
});

app.post('/api/config', (req, res) => {
  const { token, phoneId, verifyToken } = req.body;
  if (token) setSystemConfig('META_WHATSAPP_TOKEN', token);
  if (phoneId) setSystemConfig('META_PHONE_NUMBER_ID', phoneId);
  if (verifyToken) setSystemConfig('META_WEBHOOK_VERIFY_TOKEN', verifyToken);

  res.json({ success: true, message: 'Settings saved to SQLite' });
});

// Production: Serve compiled frontend if dist/ exists
if (fs.existsSync(distPath)) {
  console.log(`📦 Serving production build from: ${distPath}`);
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start background automation scheduler
startAutomationScheduler(broadcast);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Wedding Guest Manager Backend running at http://localhost:${PORT}`);
  console.log(`⚡ WebSocket endpoint at ws://localhost:${PORT}/ws`);
  console.log(`💾 Connected to SQLite Database (server/data/wedding.db)`);
});
