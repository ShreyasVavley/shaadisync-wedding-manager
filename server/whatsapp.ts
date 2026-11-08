import {
  getAllGuests,
  getGuestByIdOrToken,
  updateGuestRSVP,
  recordActivity,
  recordWebhookLog,
  getSystemConfig,
  getEventDetails,
} from './db';
import { Guest, ActivityEvent } from '../src/types/wedding';

interface WhatsAppSendResult {
  success: boolean;
  messageId: string;
  status: 'sent' | 'delivered' | 'simulated';
  recipientPhone: string;
  provider: 'meta_cloud_api' | 'simulator';
}

export function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'https://shaadisync-wedding-manager.onrender.com'
  );
}

/**
 * Dispatch an automated WhatsApp message to a guest.
 * If META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID are configured in environment or DB,
 * calls Meta Graph API v21.0. Otherwise gracefully operates in simulated mode.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const token = process.env.META_WHATSAPP_TOKEN || getSystemConfig('META_WHATSAPP_TOKEN');
  const phoneId = process.env.META_PHONE_NUMBER_ID || getSystemConfig('META_PHONE_NUMBER_ID');

  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

  if (token && phoneId) {
    try {
      const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: true, body: messageText },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const msgId = data.messages?.[0]?.id || `wamid.${Date.now()}`;
        return {
          success: true,
          messageId: msgId,
          status: 'sent',
          recipientPhone: cleanPhone,
          provider: 'meta_cloud_api',
        };
      } else {
        const errorText = await response.text();
        console.warn('Meta WhatsApp Cloud API error:', errorText);
      }
    } catch (err) {
      console.error('Failed to dispatch via Meta API:', err);
    }
  }

  // Simulator / Demo fallback
  return {
    success: true,
    messageId: `sim-wa-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    status: 'simulated',
    recipientPhone: cleanPhone,
    provider: 'simulator',
  };
}

/**
 * Parses incoming natural language text from guests over WhatsApp
 * Examples:
 * - "Yes 4 people veg"
 * - "Haan 2 pax non veg arriving 8pm"
 * - "Sorry cannot come"
 * - "Confirmed 5 Jain"
 */
export function parseInboundWhatsAppMessage(text: string): {
  action: 'confirm' | 'decline' | 'inquiry';
  attendingCount?: number;
  diet?: 'veg' | 'non-veg' | 'jain';
  arrivalTime?: string;
  notes?: string;
  mentionedEvents?: string[];
} {
  const lower = text.toLowerCase();

  // Decline indicators (English & Hindi/Hinglish)
  if (
    lower.includes('no') ||
    lower.includes('sorry') ||
    lower.includes('cannot') ||
    lower.includes('cant') ||
    lower.includes('decline') ||
    lower.includes('nahi') ||
    lower.includes('maaf') ||
    lower.includes('regret') ||
    lower.trim() === '2'
  ) {
    return {
      action: 'decline',
      notes: text.trim(),
    };
  }

  // Attendance count parsing
  let attendingCount = 2; // sensible fallback
  const numMatch = lower.match(/\b([1-9]|10)\s*(pax|people|guests|members|persons|log|jana|adults)?\b/);
  if (numMatch && numMatch[1]) {
    attendingCount = parseInt(numMatch[1], 10);
  } else if (/^\s*1\s*$/.test(lower)) {
    attendingCount = 2;
  }

  // Dietary preference parsing
  let diet: 'veg' | 'non-veg' | 'jain' = 'veg';
  if (lower.includes('non-veg') || lower.includes('non veg') || lower.includes('chicken') || lower.includes('meat') || lower.includes('fish') || lower.includes('mutton')) {
    diet = 'non-veg';
  } else if (lower.includes('jain') || lower.includes('swaminarayan') || lower.includes('no onion') || lower.includes('no garlic')) {
    diet = 'jain';
  }

  // Arrival time parsing
  let arrivalTime = '07:30 PM';
  if (lower.includes('6:30') || lower.includes('6.30')) arrivalTime = '06:30 PM';
  else if (lower.includes('7:00') || lower.includes('7pm') || (lower.includes('7') && lower.includes('baje'))) arrivalTime = '07:00 PM';
  else if (lower.includes('7:30') || lower.includes('7.30')) arrivalTime = '07:30 PM';
  else if (lower.includes('8:00') || lower.includes('8pm') || (lower.includes('8') && lower.includes('baje'))) arrivalTime = '08:00 PM';
  else if (lower.includes('8:30') || lower.includes('8.30')) arrivalTime = '08:30 PM';
  else if (lower.includes('9:00') || lower.includes('9pm') || (lower.includes('9') && lower.includes('baje'))) arrivalTime = '09:00 PM';

  // Multi-event ceremony recognition
  const mentionedEvents: string[] = [];
  if (lower.includes('haldi') || lower.includes('mehendi')) mentionedEvents.push('haldi');
  if (lower.includes('sangeet') || lower.includes('cocktail') || lower.includes('dj')) mentionedEvents.push('sangeet');
  if (lower.includes('phera') || lower.includes('wedding') || lower.includes('varmala') || lower.includes('shaadi') || lower.includes('mandap')) mentionedEvents.push('wedding');
  if (lower.includes('reception') || lower.includes('dinner') || lower.includes('banquet')) mentionedEvents.push('reception');

  return {
    action: 'confirm',
    attendingCount,
    diet,
    arrivalTime,
    notes: text.trim(),
    mentionedEvents: mentionedEvents.length > 0 ? mentionedEvents : undefined,
  };
}

/**
 * Processes an inbound WhatsApp message from a guest phone number,
 * updates the SQLite database, and returns the auto-reply text.
 */
export async function handleInboundWhatsAppWebhook(
  senderPhone: string,
  messageBody: string,
  broadcastFn: (type: string, data: any) => void
): Promise<{ replyText: string; guest: Guest | null }> {
  const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
  const guests = getAllGuests();
  const event = getEventDetails();

  // Find guest matching the sender's phone
  const guest = guests.find((g) => {
    const gPhone = g.phone.replace(/[^0-9]/g, '');
    return cleanPhone.endsWith(gPhone.slice(-10)) || gPhone.endsWith(cleanPhone.slice(-10));
  });

  const parsed = parseInboundWhatsAppMessage(messageBody);
  let replyText = '';
  let updatedGuest: Guest | null = null;

  if (!guest) {
    replyText = `🙏 Namaste! Thank you for reaching out to ${event.couple}'s wedding coordination desk.\n\nWe could not automatically identify your phone number. Please visit our web portal to confirm your RSVP:\n👉 ${getAppUrl()}`;

    recordWebhookLog({
      sender_phone: senderPhone,
      guest_name: null,
      message_content: messageBody,
      parsed_action: 'unidentified_sender',
      reply_sent: replyText,
      status: 'auto_replied',
    });

    return { replyText, guest: null };
  }

  const magicLink = `${getAppUrl()}?guest=${guest.magicToken}`;
  const gatePassLink = `${magicLink}&pass=1`;

  if (parsed.action === 'confirm') {
    const count = parsed.attendingCount || guest.invitedCount;
    const allowed = guest.allowedSubEvents || ['wedding', 'reception'];

    // Multi-event ceremony security boundary:
    // If specific events are mentioned by guest on WhatsApp, filter by what they are actually allowed to attend!
    let subEventsToUpdate: Record<string, boolean> = {};
    if (parsed.mentionedEvents && parsed.mentionedEvents.length > 0) {
      for (const ev of allowed) {
        subEventsToUpdate[ev] = parsed.mentionedEvents.includes(ev);
      }
    } else {
      // Default to confirming all their allowed ceremonies
      for (const ev of allowed) {
        subEventsToUpdate[ev] = true;
      }
    }

    updatedGuest = updateGuestRSVP(guest.id, {
      status: 'confirmed',
      attendingCount: count,
      diet: parsed.diet || 'veg',
      arrivalTime: parsed.arrivalTime || '07:30 PM',
      notes: parsed.notes || 'Confirmed via WhatsApp Chatbot',
      subEvents: subEventsToUpdate,
    });

    const confirmedEventNames = Object.entries(updatedGuest.subEvents || {})
      .filter(([_, v]) => v)
      .map(([k]) => k.toUpperCase())
      .join(', ');

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: guest.name,
      type: 'rsvp_confirmed',
      description: `Confirmed ${count} guests via WhatsApp Automation (${parsed.diet?.toUpperCase()}, ${parsed.arrivalTime}) [${confirmedEventNames || 'ALL'}]`,
      timestamp: 'Just now',
      count,
      diet: parsed.diet,
    };

    recordActivity(activity);
    broadcastFn('RSVP_UPDATED', { guest: updatedGuest, activity });

    // Format high-touch WhatsApp confirmation with Digital Gate Pass link
    replyText = `✅ *RSVP Confirmed & Gate Pass Issued!* 🙏\n\nDear *${guest.name}*,\n\nWe have successfully registered your party of *${count} guests* (${parsed.diet?.toUpperCase()}) arriving around *${parsed.arrivalTime}* at ${event.venue}.\n\n📅 *Confirmed Ceremonies:*\n${Object.entries(updatedGuest.subEvents || {})
      .filter(([_, v]) => v)
      .map(([k]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`)
      .join('\n')}\n\n🎟️ *Your Digital Gate Pass & Priority Valet QR:*\n👉 ${gatePassLink}\n\nShow this pass at the Taj Palace entrance gate for priority VIP valet parking and entry. We cannot wait to celebrate with you! 🎉`;
  } else {
    updatedGuest = updateGuestRSVP(guest.id, {
      status: 'declined',
      attendingCount: 0,
      diet: null,
      arrivalTime: null,
      notes: parsed.notes || 'Sent regrets via WhatsApp Chatbot',
      subEvents: {},
    });

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: guest.name,
      type: 'rsvp_declined',
      description: `Sent regrets via WhatsApp Automation ("${messageBody}")`,
      timestamp: 'Just now',
    };

    recordActivity(activity);
    broadcastFn('RSVP_UPDATED', { guest: updatedGuest, activity });

    replyText = `🙏 *Thank You, ${guest.name}*\n\nWe have noted your regrets for ${event.couple}'s wedding. You will be warmly missed! Thank you for letting us know promptly so we can adjust our banquet food preparation and avoid waste. ❤️`;
  }

  recordWebhookLog({
    sender_phone: senderPhone,
    guest_name: guest.name,
    message_content: messageBody,
    parsed_action: `${parsed.action.toUpperCase()} (${parsed.attendingCount || 0} pax, ${parsed.diet || 'N/A'})`,
    reply_sent: replyText,
    status: 'auto_replied',
  });

  return { replyText, guest: updatedGuest };
}
