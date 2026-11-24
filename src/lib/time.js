export const TZ = 'America/Chicago';

export const HOURS = [
  { day: 0, name: 'Sunday', short: 'Sun', open: false },
  { day: 1, name: 'Monday', short: 'Mon', open: false },
  { day: 2, name: 'Tuesday', short: 'Tue', open: true },
  { day: 3, name: 'Wednesday', short: 'Wed', open: false },
  { day: 4, name: 'Thursday', short: 'Thu', open: true },
  { day: 5, name: 'Friday', short: 'Fri', open: true },
  { day: 6, name: 'Saturday', short: 'Sat', open: true },
];

export const HOURS_SHORT = 'Tue & Thu–Sat · 10 AM – 5 PM';
export const HOURS_LONG = 'Tuesday, Thursday, Friday & Saturday · 10:00 AM – 5:00 PM';
export const PREFERRED_DAYS = ['Tuesday', 'Thursday', 'Friday', 'Saturday'];

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const pad = (n) => String(n).padStart(2, '0');

export function centralParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const out = {};
  for (const part of parts) {
    if (part.type !== 'literal') out[part.type] = part.value;
  }

  const hour = Number(out.hour) % 24;

  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: WEEKDAY_INDEX[out.weekday] ?? 0,
    weekdayShort: out.weekday,
  };
}

export function centralClock(date = new Date()) {
  const p = centralParts(date);
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  const suffix = p.hour < 12 ? 'AM' : 'PM';
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);

  return {
    time: `${h12}:${pad(p.minute)} ${suffix}`,
    dateLabel,
    weekday: HOURS[p.weekday].name,
  };
}

function nextOpenAfter(day) {
  for (let i = 1; i <= 7; i += 1) {
    const d = (day + i) % 7;
    if (HOURS[d].open) return { day: d, in: i };
  }
  return { day: 2, in: 1 };
}

export function studioStatus(date = new Date()) {
  const p = centralParts(date);
  const minutes = p.hour * 60 + p.minute;
  const today = HOURS[p.weekday];

  if (today.open && minutes >= 600 && minutes < 1020) {
    return {
      state: 'open',
      label: 'Open Now',
      detail: 'Until 5:00 PM',
      note: 'The studio is open. Walk-ins are welcome when the bench allows.',
      next: p.weekday,
    };
  }

  if (today.open && minutes < 600) {
    return {
      state: 'soon',
      label: 'Opens Today',
      detail: '10:00 AM',
      note: 'Back at the bench at 10:00 AM Central.',
      next: p.weekday,
    };
  }

  const next = nextOpenAfter(p.weekday);

  if (!today.open) {
    return {
      state: 'closed',
      label: 'Closed Today',
      detail: 'Open Tue & Thu–Sat, 10 AM–5 PM',
      note: 'Leave a request and Kelly will reply on the next studio day.',
      next: next.day,
      nextIn: next.in,
    };
  }

  return {
    state: 'closed',
    label: 'Closed',
    detail: `Opens ${HOURS[next.day].short} at 10:00 AM`,
    note: 'The studio reopens on the next open day.',
    next: next.day,
    nextIn: next.in,
  };
}

export function ctToday(date = new Date()) {
  const p = centralParts(date);
  return { year: p.year, month: p.month, day: p.day };
}

export function daysUntil(isoDate, now = new Date()) {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const today = ctToday(now);
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((target - base) / 86400000);
}

export function formatDateLong(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(y, m - 1, d, 12));
}

export function formatDateShort(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(y, m - 1, d, 12));
}

export function nextDateForWeekday(dayName, now = new Date()) {
  const target = DAY_INDEX[dayName];
  if (target === undefined) return '';
  const today = ctToday(now);
  const base = Date.UTC(today.year, today.month - 1, today.day);
  const current = new Date(base).getUTCDay();
  const diff = (target - current + 7) % 7;
  const date = new Date(base + diff * 86400000);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function timelineFor(days) {
  if (days === null || days === undefined) return null;

  if (days < 0) {
    return {
      tone: 'past',
      badge: 'Date Passed',
      title: 'Choose an upcoming date',
      copy: 'Pick your new event date and we will map the fitting schedule backward from it.',
    };
  }

  if (days >= 14) {
    return {
      tone: 'standard',
      badge: 'Standard Timeline · 14+ Days',
      title: 'A comfortable runway',
      copy: 'There is time for a calm, precise schedule. Bridal and formal pieces are best started six to eight weeks out.',
    };
  }

  if (days >= 7) {
    return {
      tone: 'priority',
      badge: 'Priority Scheduling · 7–13 Days',
      title: 'Priority scheduling',
      copy: 'This is usually workable. Call the studio soon so Kelly can reserve bench time before the week fills.',
    };
  }

  return {
    tone: 'urgent',
    badge: 'Urgent Rush Fitting · Under 7 Days',
    title: 'This one needs a phone call',
    copy: 'Same-week work depends on the calendar and the garment. Call before coming in so we can tell you honestly what is possible.',
  };
}

export function googleCalendarUrl({ name, garment, day, eventDate, notes }) {
  const preferredDate = nextDateForWeekday(day);
  const startDate = (preferredDate || '').replace(/-/g, '');
  const dates = startDate ? `${startDate}T100000/${startDate}T110000` : '';

  const title = garment
    ? `Fitting at Collierville Alterations — ${garment}`
    : 'Fitting at Collierville Alterations';

  const detailLines = [
    `Fitting request for ${name || 'a client'}.`,
    garment ? `Garment: ${garment}` : null,
    eventDate ? `Event date: ${formatDateLong(eventDate)}` : null,
    notes ? `Notes: ${notes}` : null,
    'Cash-only studio. Bring the shoes and undergarments you plan to wear with the garment.',
    'Kelly will confirm the exact time by phone or email.',
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    ctz: TZ,
    details: detailLines.join('\n'),
    location: 'Collierville Alterations, 567 W Poplar Ave, Suite 1, Collierville, TN 38017',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
