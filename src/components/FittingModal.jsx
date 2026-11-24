import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BUSINESS, GARMENT_OPTIONS } from '../data/content';
import {
  centralParts,
  ctToday,
  daysUntil,
  formatDateLong,
  formatDateShort,
  googleCalendarUrl,
  nextDateForWeekday,
  PREFERRED_DAYS,
} from '../lib/time';
import {
  ArrowRight,
  CalendarIcon,
  CashIcon,
  Check,
  CloseIcon,
  MailIcon,
  NeedleEmblem,
  PhoneIcon,
} from './ui';

const ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || '';
const pad = (n) => String(n).padStart(2, '0');

const EMPTY_FORM = {
  name: '',
  contact: '',
  garment: '',
  eventDate: '',
  day: '',
  notes: '',
  _gotcha: '',
};

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[10.5px] leading-snug text-[#A9503C]">
      {children}
    </p>
  );
}

function PassCell({ label, value, wide = false }) {
  return (
    <div className={`bg-white px-4 py-3.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted/55">{label}</p>
      <p className="mt-1.5 text-[12px] font-medium leading-snug text-ink">{value}</p>
    </div>
  );
}

export default function FittingModal({ open, onClose, prefill }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const nameRef = useRef(null);
  const openerRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [view, setView] = useState('form');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pass, setPass] = useState(null);

  const today = ctToday();
  const minDate = `${today.year}-${pad(today.month)}-${pad(today.day)}`;

  const preferredDate = useMemo(
    () => (form.day ? nextDateForWeekday(form.day) : ''),
    [form.day],
  );

  const close = useCallback(() => {
    if (sending) return;
    onClose();
  }, [onClose, sending]);

  /* Reset the form whenever the modal is opened, carrying any prefill. */
  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY_FORM,
      garment: prefill?.garment || '',
      eventDate: prefill?.eventDate || '',
      notes: prefill?.notes || '',
    });
    setErrors({});
    setView('form');
    setPass(null);
    setSubmitError('');
    setSending(false);
  }, [open, prefill]);

  /* Remember the opener and return focus to it when the modal closes */
  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  /* Scroll lock */
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Escape + focus trap */
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  /* Focus the first field; move focus to the pass heading after success */
  useEffect(() => {
    if (!open) return undefined;
    const id = window.setTimeout(() => {
      if (view === 'form') {
        nameRef.current?.focus();
      } else {
        panelRef.current?.querySelector('[data-pass-heading]')?.focus();
      }
      overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 140);
    return () => window.clearTimeout(id);
  }, [open, view]);

  if (!open) return null;

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSubmitError('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please add your name.';
    const contact = form.contact.trim();
    if (!contact) {
      next.contact = 'A phone number or email lets us confirm your fitting.';
    } else if (!contact.includes('@') && contact.replace(/\D/g, '').length < 7) {
      next.contact = 'Enter a phone number or a full email address.';
    }
    if (!form.garment) next.garment = 'Choose the garment you need fitted.';
    if (form.eventDate && daysUntil(form.eventDate) < 0) {
      next.eventDate = 'That event date has already passed. Choose an upcoming date.';
    }
    if (!form.day) {
      next.day = 'Choose a preferred studio day.';
    } else if (nextDateForWeekday(form.day) === minDate) {
      const now = centralParts();
      if (now.hour * 60 + now.minute >= 1020) {
        next.day = `The studio has closed for today (open until 5 PM Central). Choose another day.`;
      }
    }
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      panelRef.current?.querySelector(`[name="${firstKey}"]`)?.focus();
      return;
    }

    if (!ENDPOINT) {
      setSubmitError(
        `Online requests aren’t available right now, so nothing was sent. Please call ${BUSINESS.phone} or email ${BUSINESS.email} to book your fitting.`,
      );
      return;
    }

    setSending(true);
    setSubmitError('');

    const preferred = nextDateForWeekday(form.day);
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      ...(form.contact.includes('@') ? { email: form.contact.trim() } : {}),
      garment: form.garment,
      eventDate: form.eventDate || 'Not specified',
      preferredDay: form.day,
      preferredDate: preferred,
      notes: form.notes.trim(),
      _gotcha: form._gotcha,
      source: 'colliervillealterations.com',
      _subject: `New fitting request — ${form.name.trim() || 'Collierville Alterations'}`,
    };

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Request failed');

      const now = new Date();
      const contactIsEmail = payload.contact.includes('@');

      setPass({
        number: `CA-${now.getFullYear().toString().slice(2)}${pad(now.getMonth() + 1)}${pad(
          now.getDate(),
        )}-${Math.floor(100 + Math.random() * 900)}`,
        name: payload.name,
        contact: payload.contact,
        contactIsEmail,
        garment: payload.garment,
        day: payload.preferredDay,
        preferredDate: preferred,
        eventDate: form.eventDate,
        notes: payload.notes,
      });
      setView('pass');
    } catch {
      setSubmitError(
        `That request didn’t send. Please call ${BUSINESS.phone} and we’ll get you on the calendar.`,
      );
    } finally {
      setSending(false);
    }
  };

  const firstName = pass?.name?.trim().split(/\s+/)[0] || 'there';
  const eventDays =
    pass?.eventDate && pass.eventDate !== 'Not specified' ? daysUntil(pass.eventDate) : null;
  const calendarUrl = pass
    ? googleCalendarUrl({
        name: pass.name,
        garment: pass.garment,
        day: pass.day,
        eventDate: pass.eventDate && pass.eventDate !== 'Not specified' ? pass.eventDate : '',
        notes: pass.notes,
      })
    : '#';

  return (
    <div
      ref={overlayRef}
      className="no-print fixed inset-0 z-[60] overflow-y-auto bg-ink/45 px-3 py-5 backdrop-blur-sm sm:px-5 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fitting-title"
        aria-describedby={view === 'form' ? 'fitting-description' : 'fitting-pass-description'}
        className="relative mx-auto w-full max-w-[760px] rounded-[4px] border border-line bg-linen shadow-lift"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close fitting request"
          className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/90 text-muted transition-colors hover:border-brass/60 hover:text-ink sm:right-4 sm:top-4"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {view === 'form' ? (
          <>
            <div className="relative overflow-hidden border-b border-line bg-silk/40 px-6 py-7 sm:px-9 sm:py-8">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(184,142,74,0.16),transparent_65%)]"
              />
              <p className="eyebrow">Atelier Fitting Request</p>
              <h2
                id="fitting-title"
                className="mt-3 max-w-lg font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.06] tracking-[-0.01em] text-ink"
              >
                Let’s reserve your <em className="italic text-brass-dark">fitting.</em>
              </h2>
              <p id="fitting-description" className="mt-3 max-w-md text-[12.5px] leading-relaxed text-muted">
                Tell us about the garment and your date. Kelly reviews requests during studio hours
                and confirms your time by phone or email.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[9.5px] uppercase tracking-[0.12em] text-muted/70">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-brass" /> No payment now
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-brass" /> Quoted in person
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CashIcon className="h-3 w-3 text-brass" /> Cash at pickup
                </span>
              </div>
            </div>

            <form onSubmit={submit} noValidate className="px-6 py-6 sm:px-9 sm:py-8">
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="_gotcha">Leave this field empty</label>
                <input
                  id="_gotcha"
                  name="_gotcha"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form._gotcha}
                  onChange={(event) => update('_gotcha', event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label htmlFor="name" className="field-label">
                    Name <span className="text-brass">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={`input ${errors.name ? 'input-error' : ''}`}
                  />
                  <FieldError id="name-error">{errors.name}</FieldError>
                </div>

                <div>
                  <label htmlFor="contact" className="field-label">
                    Phone or Email <span className="text-brass">*</span>
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    type="text"
                    autoComplete="tel"
                    value={form.contact}
                    onChange={(event) => update('contact', event.target.value)}
                    placeholder="(901) 555-0134 or you@email.com"
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'contact-error' : undefined}
                    className={`input ${errors.contact ? 'input-error' : ''}`}
                  />
                  <FieldError id="contact-error">{errors.contact}</FieldError>
                </div>

                <div>
                  <label htmlFor="garment" className="field-label">
                    Garment Type <span className="text-brass">*</span>
                  </label>
                  <select
                    id="garment"
                    name="garment"
                    value={form.garment}
                    onChange={(event) => update('garment', event.target.value)}
                    aria-invalid={Boolean(errors.garment)}
                    aria-describedby={errors.garment ? 'garment-error' : undefined}
                    className={`select ${errors.garment ? 'input-error' : ''}`}
                  >
                    <option value="">Select a garment</option>
                    {GARMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError id="garment-error">{errors.garment}</FieldError>
                </div>

                <div>
                  <label htmlFor="eventDate" className="field-label">
                    Event Date <span className="font-normal normal-case tracking-normal text-muted/50">(optional)</span>
                  </label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    min={minDate}
                    value={form.eventDate}
                    onChange={(event) => update('eventDate', event.target.value)}
                    aria-invalid={Boolean(errors.eventDate)}
                    aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                    className={`input ${errors.eventDate ? 'input-error' : ''}`}
                  />
                  <FieldError id="eventDate-error">{errors.eventDate}</FieldError>
                  {form.eventDate && !errors.eventDate && daysUntil(form.eventDate) >= 0 && (
                    <p className="mt-1.5 text-[10px] text-brass-dark">
                      {daysUntil(form.eventDate)} days out · we’ll plan backward from here
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="day" className="field-label">
                    Preferred Day <span className="text-brass">*</span>
                  </label>
                  <select
                    id="day"
                    name="day"
                    value={form.day}
                    onChange={(event) => update('day', event.target.value)}
                    aria-invalid={Boolean(errors.day)}
                    aria-describedby={errors.day ? 'day-error' : undefined}
                    className={`select ${errors.day ? 'input-error' : ''}`}
                  >
                    <option value="">Choose a studio day</option>
                    {PREFERRED_DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <FieldError id="day-error">{errors.day}</FieldError>
                  {form.day && preferredDate && (
                    <p className="mt-1.5 text-[10px] text-muted/70">
                      Next {form.day}: {formatDateShort(preferredDate)} · Kelly will confirm the time.
                    </p>
                  )}
                </div>

                <div className="hidden rounded-[2px] border border-dashed border-brass/30 bg-silk/30 px-4 py-3 sm:block">
                  <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-dark">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Studio hours
                  </p>
                  <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                    Tue, Thu, Fri &amp; Sat · 10 AM – 5 PM. Closed Sun, Mon &amp; Wed.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="field-label">
                    Notes <span className="font-normal normal-case tracking-normal text-muted/50">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    placeholder="What are we altering? Tell us about the garment, your event, and any deadline."
                    className="input min-h-[92px] resize-y"
                  />
                </div>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[2px] border border-[#A9503C]/30 bg-[#A9503C]/[0.06] px-4 py-3 text-[11.5px] leading-relaxed text-[#8F4333]"
                >
                  {submitError}{' '}
                  <a href={BUSINESS.phoneHref} className="font-semibold underline underline-offset-2">
                    Call the studio
                  </a>
                  {' · '}
                  <a href={BUSINESS.emailHref} className="font-semibold underline underline-offset-2">
                    Email the studio
                  </a>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[19rem] text-[9.5px] leading-relaxed text-muted/65">
                  Your details are only used to confirm this fitting. Cash only at pickup.
                </p>
                  <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto">
                    {sending ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Sending request
                      </>
                    ) : (
                      <>
                        Send Fitting Request
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
              </div>

              <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted/70">
                Prefer to talk?
                <a href={BUSINESS.phoneHref} className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brass-dark">
                  <PhoneIcon className="h-3 w-3" />
                  {BUSINESS.phone}
                </a>
                <span className="text-muted/40">·</span>
                <a href={BUSINESS.emailHref} className="inline-flex items-center gap-1 hover:text-brass-dark">
                  <MailIcon className="h-3 w-3" />
                  Email the studio
                </a>
              </p>
            </form>
          </>
        ) : (
          pass && (
            <div className="px-4 py-5 sm:px-8 sm:py-8">
              <div className="pass-card overflow-hidden rounded-[3px] border border-brass/35 bg-white shadow-[0_18px_50px_-40px_rgba(26,28,32,0.5)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-brass/40 bg-brass-wash/35 px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-2.5">
                    <NeedleEmblem className="h-7 w-7 text-brass" />
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass-dark">
                        Atelier Fitting Pass
                      </p>
                      <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.16em] text-muted/60">
                        Collierville, TN · Est. 2018
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-brass/25 bg-white/70 px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-brass-dark">
                    {pass.number}
                  </span>
                </div>

                <div className="px-5 py-6 sm:px-7 sm:py-7">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-linen">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
                        Request received
                      </p>
                      <h2
                        id="fitting-title"
                        data-pass-heading
                        tabIndex={-1}
                        className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] leading-[1.08] text-ink outline-none"
                      >
                        Thank you, {firstName}.
                      </h2>
                      <p
                        id="fitting-pass-description"
                        className="mt-2 max-w-md text-[12px] leading-relaxed text-muted"
                      >
                        Kelly will confirm your fitting by {pass.contactIsEmail ? 'email' : 'phone'}{' '}
                        during studio hours. No payment is due until pickup.
                      </p>
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-2">
                    <PassCell label="Name" value={pass.name} />
                    <PassCell label="Garment" value={pass.garment} />
                    <PassCell
                      label="Preferred day"
                      value={
                        pass.preferredDate
                          ? `${pass.day} · ${formatDateShort(pass.preferredDate)}`
                          : pass.day
                      }
                    />
                    <PassCell
                      label="Event date"
                      value={
                        pass.eventDate && pass.eventDate !== 'Not specified'
                          ? `${formatDateLong(pass.eventDate)}${
                              eventDays !== null ? ` · ${eventDays} days out` : ''
                            }`
                          : 'Not specified'
                      }
                    />
                    <PassCell label="Contact" value={pass.contact} wide />
                  </dl>

                  {pass.notes && (
                    <div className="mt-4 rounded-[2px] border border-line/80 bg-silk/35 px-4 py-3">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-muted/55">
                        Your notes
                      </p>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{pass.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[2px] border border-line bg-white px-4 py-3.5">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-brass-dark">
                        The studio
                      </p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                        {BUSINESS.street}
                        <br />
                        {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                        <br />
                        <span className="text-muted/70">Across from Walmart on West Poplar</span>
                      </p>
                    </div>
                    <div className="rounded-[2px] border border-sage/25 bg-sage-wash/60 px-4 py-3.5">
                      <p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-sage">
                        <CashIcon className="h-3 w-3" />
                        Before you come in
                      </p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                        Bring the shoes and undergarments you’ll wear with the garment. The studio is
                        cash-only.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary !px-5 !py-3 !text-[10px]"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Add Reminder to Google Calendar
                    </a>
                    <a href={BUSINESS.phoneHref} className="btn-ghost !px-5 !py-3 !text-[10px]">
                      <PhoneIcon className="h-3.5 w-3.5" />
                      Call the studio
                    </a>
                    <button
                      type="button"
                      onClick={close}
                      className="inline-flex items-center justify-center px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink sm:ml-auto"
                    >
                      Close pass
                    </button>
                  </div>

                  <p className="mt-4 text-[9.5px] leading-relaxed text-muted/60">
                    Preferred day is a request, not a locked appointment. Kelly will confirm the exact
                    time. Cash only at pickup. Need to change something? Call {BUSINESS.phone}.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
