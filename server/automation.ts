import {
  getAllAutomations,
  getAllGuests,
  getEventDetails,
  updateAutomationLastRun,
  recordActivity,
} from './db';
import { sendWhatsAppMessage } from './whatsapp';
import { ActivityEvent } from '../src/types/wedding';

let isRunning = false;

/**
 * Triggers a specific automation rule on demand or via scheduler
 */
export async function executeAutomationRule(
  ruleId: string,
  broadcastFn: (type: string, data: any) => void
): Promise<{ success: boolean; dispatchedCount: number; message: string }> {
  const automations = getAllAutomations();
  const rule = automations.find((r) => r.id === ruleId);
  if (!rule) {
    return { success: false, dispatchedCount: 0, message: 'Automation rule not found' };
  }

  const guests = getAllGuests();
  const event = getEventDetails();
  let targetGuests = [];
  let dispatchedCount = 0;

  if (rule.trigger_type === 'catering_48h') {
    // Target all pending guests
    targetGuests = guests.filter((g) => g.status === 'pending');

    for (const g of targetGuests) {
      const magicLink = `${process.env.APP_URL || 'http://localhost:5173'}?guest=${g.magicToken}`;
      const message = `🙏 *Gentle Reminder: RSVP for ${event.couple}'s Wedding* 🙏\n\nNamaste ${g.name},\n\nWe are finalizing our banquet headcount and fresh catering preparations for *${event.date}* at *${event.venue}*.\n\nCould you kindly confirm if your family will be joining us and your meal preferences?\n👉 ${magicLink}\n\nIt takes just 10 seconds and helps us eliminate banquet food wastage. Thank you so much!\n\nWith love,\n*${event.couple}*`;

      await sendWhatsAppMessage(g.phone, message);
      dispatchedCount++;
    }

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: 'Automated Background Scheduler',
      type: 'reminder_sent',
      description: `Automated 48h Catering Cutoff Nudges dispatched to ${dispatchedCount} awaiting guests`,
      timestamp: 'Just now',
    };
    recordActivity(activity);
    broadcastFn('ACTIVITY_ADDED', { activity });
  } else if (rule.trigger_type === 'day_of_9am') {
    // Target all confirmed guests
    targetGuests = guests.filter((g) => g.status === 'confirmed');

    for (const g of targetGuests) {
      const magicLink = `${process.env.APP_URL || 'http://localhost:5173'}?guest=${g.magicToken}`;
      const message = `🎊 *Today is the Day! ${event.couple}'s Wedding Reception* 🎊\n\nDear ${g.name},\n\nWe cannot wait to celebrate with you tonight!\n\n📍 *Venue:* ${event.venue}\n🗺️ *Directions:* ${event.mapsUrl}\n⏰ *Gates Open:* ${event.time}\n\nYour party details: ${magicLink}\nSee you soon on the dance floor! 🕺💃`;

      await sendWhatsAppMessage(g.phone, message);
      dispatchedCount++;
    }

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      guestName: 'Automated Background Scheduler',
      type: 'reminder_sent',
      description: `Automated Day-of Directions dispatched to ${dispatchedCount} confirmed guests`,
      timestamp: 'Just now',
    };
    recordActivity(activity);
    broadcastFn('ACTIVITY_ADDED', { activity });
  }

  updateAutomationLastRun(rule.id, dispatchedCount);

  return {
    success: true,
    dispatchedCount,
    message: `Successfully executed "${rule.name}" for ${dispatchedCount} guests.`,
  };
}

/**
 * Background Scheduler Worker
 * Runs every 60 seconds to check if any automated rule needs triggering.
 */
export function startAutomationScheduler(broadcastFn: (type: string, data: any) => void) {
  if (isRunning) return;
  isRunning = true;

  console.log('⚡ Background Automated Messaging Scheduler started (Interval: 60s)');

  setInterval(async () => {
    try {
      const automations = getAllAutomations();
      // Check for active rules
      for (const rule of automations) {
        if (!rule.is_enabled) continue;
        // In production, compares event.date with Date.now()
        // e.g., if (hoursRemaining <= 48 && !hasRunToday) { executeAutomationRule(...) }
      }
    } catch (err) {
      console.error('Error in automation scheduler tick:', err);
    }
  }, 60000);
}
