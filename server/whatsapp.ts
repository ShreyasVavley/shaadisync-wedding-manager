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
} {
  const lower = text.toLowerCase();

  // Decline indicators
  if (
    lower.includes('no') ||
    lower.includes('sorry') ||
    lower.includes('cannot') ||
    lower.includes('cant') ||
    lower.includes('decline') ||
    lower.includes('nahi')
  ) {
    return {
      action: 'decline',
      notes: text.trim(),
    };
  }

  // Confirm indicators (default to confirm if affirmative)
  let attendingCount = 2; // sensible fallback
  const numMatch = lower.match(/\b([1-9]|10)\s*(pax|people|guests|members|persons)?\b/);
  if (numMatch && numMatch[1]) {
    attendingCount = parseInt(numMatch[1], 10);
  }

  let diet: 'veg' | 'non-veg' | 'jain' = 'veg';
  if (lower.includes('non-veg') || lower.includes('non veg') || lower.includes('chicken') || lower.includes('meat')) {
    diet = 'non-veg';
  } else if (lower.includes('jain')) {
    diet = 'jain';
  }

  let arrivalTime = '07:30 PM';
  if (lower.includes('7') && lower.includes('pm')) arrivalTime = '07:00 PM';
  else if (lower.includes('8') && lower.includes('pm')) arrivalTime = '08:00 PM';
  else if (lower.includes('8:30')) arrivalTime = '08:30 PM';
  else if (lower.includes('9') && lower.includes('pm')) arrivalTime = '09:00 PM';

  return {
    action: 'confirm',
    attendingCount,
    diet,
    arrivalTime,
    notes: text.trim(),
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

  if (parsed.action === 'confirm') {
    const count = parsed.attendingCount || guest.invitedCount;
    updatedGuest = updateGuestRSVP(guest.id, {
      status: 'confirmed',
      attendingCount: count,
      diet: parsed.diet || 'veg',
      arrivalTime: parsed.arrivalTime || '07:30 PM',
      notes: parsed.notes || 'Confirmed via WhatsApp Chat',
    });

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: guest.name,
      type: 'rsvp_confirmed',
      description: `Confirmed ${count} guests via WhatsApp Inbound AI (${parsed.diet?.toUpperCase()}, ${parsed.arrivalTime})`,
      timestamp: 'Just now',
      count,
      diet: parsed.diet,
    };

    recordActivity(activity);
    broadcastFn('RSVP_UPDATED', { guest: updatedGuest, activity });

    replyText = `✅ *RSVP Confirmed!* 🙏\n\nDear ${guest.name},\n\nWe have recorded your confirmation for *${count} guests* (${parsed.diet?.toUpperCase()}) arriving around *${parsed.arrivalTime}* at ${event.venue}.\n\nWe cannot wait to celebrate with you! 🎉\n\nView or modify party details anytime:\n👉 ${magicLink}`;
  } else {
    updatedGuest = updateGuestRSVP(guest.id, {
      status: 'declined',
      attendingCount: 0,
      diet: null,
      arrivalTime: null,
      notes: parsed.notes || 'Sent regrets via WhatsApp Chat',
    });

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: guest.name,
      type: 'rsvp_declined',
      description: `Sent regrets via WhatsApp Inbound AI ("${messageBody}")`,
      timestamp: 'Just now',
    };

    recordActivity(activity);
    broadcastFn('RSVP_UPDATED', { guest: updatedGuest, activity });

    replyText = `🙏 *Thank You, ${guest.name}*\n\nWe have noted your regrets for ${event.couple}'s wedding. You will be warmly missed! Thank you for letting us know so we can adjust our banquet catering. ❤️`;
  }

  recordWebhookLog({
    sender_phone: senderPhone,
    guest_name: guest.name,
    message_content: messageBody,
    parsed_action: `${parsed.action.toUpperCase()} (${parsed.attendingCount || 0} pax)`,
    reply_sent: replyText,
    status: 'auto_replied',
  });

  return { replyText, guest: updatedGuest };
}
