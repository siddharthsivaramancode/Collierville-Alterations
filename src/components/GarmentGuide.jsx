import { useMemo, useState } from 'react';
import { GARMENTS, BUSINESS } from '../data/content';
import { ctToday, daysUntil, formatDateLong, timelineFor } from '../lib/time';
import { ArrowRight, CalendarIcon, Check, PhoneIcon, Reveal, SectionHead } from './ui';

const pad = (n) => String(n).padStart(2, '0');

function tierClasses(tone) {
  switch (tone) {
    case 'standard':
      return 'border-sage/35 bg-sage-wash text-sage';
    case 'priority':
      return 'border-brass/45 bg-brass-wash text-brass-dark';
    case 'urgent':
      return 'border-ink bg-ink text-linen';
    default:
      return 'border-line bg-silk text-muted';
  }
}

function DeadlineChecker({ selectedDate, onDateChange, onRequest }) {
  const today = ctToday();
  const minDate = `${today.year}-${pad(today.month)}-${pad(today.day)}`;

  const days = selectedDate ? daysUntil(selectedDate) : null;
  const info = timelineFor(days);
  const isUrgent = info && (info.tone === 'urgent' || info.tone === 'past');

  return (
    <div className="mt-10 overflow-hidden rounded-[4px] border border-line bg-ivory shadow-card">
      <div className="grid lg:grid-cols-12">
        <div className="border-b border-line bg-silk/45 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <span className="font-display text-[12px] italic text-brass/80">i.</span>
            <span className="h-px w-6 bg-brass/40" />
            <p className="eyebrow">Event Deadline Checker</p>
          </div>

          <h3 className="mt-4 font-display text-[26px] leading-[1.15] text-ink sm:text-[30px]">
            Check your event timeline.
          </h3>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            Choose your wedding, prom or event date. We will tell you where you stand and what the
            studio can realistically promise.
          </p>

          <label htmlFor="event-date" className="field-label mt-7">
            Wedding, prom or event date
          </label>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brass" />
            <input
              id="event-date"
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="input !pl-10"
            />
          </div>
          <p className="mt-2.5 text-[10.5px] leading-relaxed text-muted/80">
            Nothing is booked yet — this only helps us plan your fittings.
          </p>
        </div>

        <div className="p-6 sm:p-8 lg:col-span-7">
          {!selectedDate && (
            <div className="flex h-full flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                How we schedule
              </p>
              <div className="mt-4 space-y-px overflow-hidden rounded-[2px] border border-line">
                {[
                  { tone: 'standard', label: 'Standard Timeline', detail: '14+ days out', dot: 'bg-sage' },
                  { tone: 'priority', label: 'Priority Scheduling', detail: '7–13 days out', dot: 'bg-brass' },
                  { tone: 'urgent', label: 'Urgent Rush Fitting', detail: 'Under 7 days', dot: 'bg-ink' },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center justify-between gap-4 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                      <span className="text-[12px] font-medium text-ink">{tier.label}</span>
                    </div>
                    <span className="text-[10.5px] tracking-wide text-muted">{tier.detail}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 font-display text-[15px] italic leading-relaxed text-muted">
                “The best fittings happen with a little room to breathe.”
              </p>
              <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.2em] text-muted/50">
                Kelly · Master Tailor
              </p>
            </div>
          )}

          {selectedDate && info && (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <span className="font-display text-[clamp(3.2rem,7vw,4.6rem)] leading-[0.8] tracking-[-0.03em] text-ink">
                    {days < 0 ? '—' : days}
                  </span>
                  <div className="pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                      {days === 1 ? 'Day remaining' : 'Days remaining'}
                    </p>
                    <p className="mt-1 text-[12.5px] font-medium text-ink">
                      {days < 0 ? 'Date has passed' : days === 0 ? 'Your event is today' : 'Until your event'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted">{formatDateLong(selectedDate)}</p>
              </div>

              <div className={`mt-6 flex flex-col gap-2 rounded-[2px] border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${tierClasses(info.tone)}`}>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]">
                  {info.badge}
                </span>
                {info.tone === 'urgent' && (
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] underline underline-offset-4 hover:opacity-80"
                  >
                    <PhoneIcon className="h-3 w-3" />
                    Call {BUSINESS.phone}
                  </a>
                )}
              </div>

              <p className="mt-4 font-display text-[17px] italic leading-snug text-ink">{info.title}</p>
              <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-muted">{info.copy}</p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => onRequest({ eventDate: selectedDate })}
                  className={`${isUrgent ? 'btn-ghost !px-5 !py-3' : 'btn-primary !px-5 !py-3'}`}
                >
                  Use this date in my fitting request
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-brass-dark"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  Or call the studio
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GarmentGuide({ eventDate, onEventDateChange, onRequest }) {
  const [activeId, setActiveId] = useState(GARMENTS[0].id);
  const active = useMemo(
    () => GARMENTS.find((garment) => garment.id === activeId) || GARMENTS[0],
    [activeId],
  );

  return (
    <section id="services" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            number="01"
            eyebrow="Garment & Fitting Guide"
            title={
              <>
                Every garment has its own <em className="italic text-brass-dark">kind of care.</em>
              </>
            }
            copy="Choose the piece you are bringing in. You will see what Kelly refines, how long the work usually takes, and exactly what to bring to your fitting. Tailoring is quoted in person — never off a menu."
          />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          {/* Tabs — horizontal on mobile, vertical on desktop */}
          <Reveal className="min-w-0 lg:col-span-4" delay={80}>
            <div
              className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
              role="tablist"
              aria-label="Garment types"
            >
              {GARMENTS.map((garment) => {
                const selected = garment.id === activeId;
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="tab"
                    id={`tab-${garment.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${garment.id}`}
                    onClick={() => setActiveId(garment.id)}
                    className={`group flex min-w-[188px] snap-start items-center gap-3 rounded-[3px] border px-4 py-3.5 text-left transition-all duration-300 lg:min-w-0 lg:gap-4 lg:px-5 lg:py-4 ${
                      selected
                        ? 'border-line bg-ivory shadow-card'
                        : 'border-transparent bg-transparent hover:border-line/70 hover:bg-white/40'
                    }`}
                  >
                    <span
                      className={`font-display text-[11px] italic transition-colors ${
                        selected ? 'text-brass' : 'text-muted/50'
                      }`}
                    >
                      {garment.number}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-[12.5px] font-semibold leading-tight transition-colors ${
                          selected ? 'text-ink' : 'text-muted group-hover:text-ink'
                        }`}
                      >
                        {garment.name}
                      </span>
                      <span className="mt-1 block text-[9.5px] uppercase tracking-[0.12em] text-muted/60">
                        {garment.turnaround}
                      </span>
                    </span>
                    <span
                      className={`h-1 w-1 shrink-0 rounded-full transition-all ${
                        selected ? 'bg-brass' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 hidden rounded-[3px] border border-dashed border-brass/30 bg-silk/40 p-4 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass-dark">
                A note on pricing
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                Alterations are quoted in person after pinning. Every body and every garment is
                different — an honest estimate needs to see the fit.
              </p>
            </div>
          </Reveal>

          {/* Panel */}
          <Reveal className="min-w-0 lg:col-span-8" delay={160}>
            <div
              role="tabpanel"
              id={`panel-${active.id}`}
              aria-labelledby={`tab-${active.id}`}
              className="card relative overflow-hidden p-6 shadow-card sm:p-8 lg:p-9"
            >
              <div
                aria-hidden="true"
                className="absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle_at_top_right,rgba(184,142,74,0.12),transparent_70%)]"
              />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass">
                    Garment {active.number} / 05
                  </p>
                  <h3 className="mt-2.5 font-display text-[26px] leading-tight text-ink sm:text-[30px]">
                    {active.name}
                  </h3>
                  <p className="mt-2 text-[13px] text-muted">{active.tagline}</p>
                </div>
                <div className="rounded-full border border-brass/35 bg-brass-wash/60 px-3.5 py-1.5 text-right">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-brass-dark/70">
                    Typical turnaround
                  </p>
                  <p className="text-[12px] font-semibold text-brass-dark">{active.turnaround}</p>
                </div>
              </div>

              <div className="relative mt-7 grid gap-7 border-t border-line pt-7 sm:grid-cols-2 sm:gap-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    What we refine
                  </p>
                  <ul className="mt-4 space-y-3">
                    {active.includes.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[12.5px] leading-snug text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-l border-brass/40 pl-3 text-[11px] italic leading-relaxed text-muted/90">
                    {active.turnaroundNote}
                  </p>
                </div>

                <div className="rounded-[2px] border border-line/80 bg-silk/30 p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    What to bring to your fitting
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {active.bring.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[12px] leading-snug text-muted">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full border border-brass/70 bg-brass/40" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative mt-7 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10.5px] leading-relaxed text-muted/80">{active.note}</p>
                <div className="flex shrink-0 gap-2.5">
                  <a href={BUSINESS.phoneHref} className="btn-quiet">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    Call
                  </a>
                  <button
                    type="button"
                    onClick={() => onRequest({ garment: active.modalValue })}
                    className="btn-primary !px-5 !py-2.5 !text-[10px]"
                  >
                    Request this fitting
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <DeadlineChecker
            selectedDate={eventDate}
            onDateChange={onEventDateChange}
            onRequest={onRequest}
          />
        </Reveal>
      </div>
    </section>
  );
}
