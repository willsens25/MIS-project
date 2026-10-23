import { ToastNotification, SnoozeDuration } from '../types';

export interface SnoozedDeadlineReminder {
  id: string;
  toastId: string;
  title: string;
  message: string;
  category: 'deadline';
  snoozedUntil: number; // timestamp in epoch ms
  snoozeDuration: SnoozeDuration;
  snoozeDurationLabel: string;
  createdAt: number;
  actionLabel?: string;
  divisionName?: string;
  eventId?: string;
  targetDate?: string;
}

export const SNOOZE_STORAGE_KEY = 'mis_snoozed_deadline_reminders';

export const SNOOZE_PRESETS: Array<{
  key: SnoozeDuration;
  label: string;
  hours: number;
  durationMs: number;
  description: string;
}> = [
  {
    key: '1h',
    label: '1 Jam',
    hours: 1,
    durationMs: 60 * 60 * 1000,
    description: 'Tunda pengingat selama 1 jam ke depan'
  },
  {
    key: '4h',
    label: '4 Jam',
    hours: 4,
    durationMs: 4 * 60 * 60 * 1000,
    description: 'Tunda pengingat selama 4 jam ke depan'
  },
  {
    key: '1d',
    label: '1 Hari',
    hours: 24,
    durationMs: 24 * 60 * 60 * 1000,
    description: 'Tunda pengingat hingga besok (24 jam)'
  }
];

export function getStoredSnoozedReminders(): SnoozedDeadlineReminder[] {
  try {
    const raw = localStorage.getItem(SNOOZE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading snoozed deadline reminders:', err);
  }
  return [];
}

export function saveSnoozedReminders(list: SnoozedDeadlineReminder[]): void {
  try {
    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('mis-snoozed-reminders-updated'));
  } catch (err) {
    console.warn('Error saving snoozed deadline reminders:', err);
  }
}

export function snoozeDeadlineReminder(
  toast: ToastNotification,
  durationKey: SnoozeDuration
): { record: SnoozedDeadlineReminder; formattedResumeTime: string } {
  const preset = SNOOZE_PRESETS.find(p => p.key === durationKey) || SNOOZE_PRESETS[0];
  const now = Date.now();
  const snoozedUntil = now + preset.durationMs;

  const record: SnoozedDeadlineReminder = {
    id: `snooze-${now}-${Math.floor(Math.random() * 10000)}`,
    toastId: toast.id,
    title: toast.title,
    message: toast.message,
    category: 'deadline',
    snoozedUntil,
    snoozeDuration: preset.key,
    snoozeDurationLabel: preset.label,
    createdAt: now,
    actionLabel: toast.actionLabel,
    divisionName: toast.divisionName,
    eventId: toast.eventId,
    targetDate: toast.targetDate
  };

  const existing = getStoredSnoozedReminders();
  // Filter out any duplicate for the same toast title/message
  const deduplicated = existing.filter(item => item.title !== toast.title);
  deduplicated.push(record);
  saveSnoozedReminders(deduplicated);

  const targetDateObj = new Date(snoozedUntil);
  const isTomorrow = targetDateObj.getDate() !== new Date().getDate();
  const formattedResumeTime = isTomorrow
    ? `Besok, ${targetDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
    : `${targetDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

  return { record, formattedResumeTime };
}

export function cancelSnoozedReminder(snoozeId: string): SnoozedDeadlineReminder | null {
  const existing = getStoredSnoozedReminders();
  const found = existing.find(i => i.id === snoozeId) || null;
  const filtered = existing.filter(i => i.id !== snoozeId);
  saveSnoozedReminders(filtered);
  return found;
}

export function checkAndPopDueSnoozedReminders(): SnoozedDeadlineReminder[] {
  const now = Date.now();
  const existing = getStoredSnoozedReminders();
  const dueItems: SnoozedDeadlineReminder[] = [];
  const remainingItems: SnoozedDeadlineReminder[] = [];

  existing.forEach(item => {
    if (now >= item.snoozedUntil) {
      dueItems.push(item);
    } else {
      remainingItems.push(item);
    }
  });

  if (dueItems.length > 0) {
    saveSnoozedReminders(remainingItems);
  }

  return dueItems;
}

export function formatSnoozeRemainingTime(snoozedUntil: number): string {
  const diffMs = snoozedUntil - Date.now();
  if (diffMs <= 0) return 'Siap muncul';

  const diffMins = Math.round(diffMs / (60 * 1000));
  if (diffMins < 60) return `${diffMins} mnt lagi`;

  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  if (diffHours < 24) {
    return remainingMins > 0 ? `${diffHours} jam ${remainingMins} mnt lagi` : `${diffHours} jam lagi`;
  }

  const days = Math.floor(diffHours / 24);
  return `${days} hari lagi`;
}
