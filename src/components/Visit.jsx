import { useEffect, useRef, useState } from 'react';
import { useCentralTime } from '../lib/useCentralTime';
import { centralClock, centralParts, HOURS, studioStatus } from '../lib/time';
import { BUSINESS } from '../data/content';
import {
  CashIcon,
  ClockIcon,
  CompassIcon,
  CopyIcon,
  MailIcon,
  MapPin,
  PhoneIcon,
  Reveal,
  SectionHead,
} from './ui';

function MiniStatus() {
  const now = useCentralTime(30000);
  const status = studioStatus(now);
  const clock = centralClock(now);
  const open = status.state === 'open';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
        <span className={`relative h-1.5 w-1.5 rounded-full ${open ? 'live-dot bg-sage text-sage' : 'bg-muted/40'}`} />
        {status.label}
      </span>
      <span className="text-[10px] tabular-nums text-muted/70">{clock.time} CT</span>
    </div>
  );
}

function StudioMap() {
  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-[4px] border border-line bg-[#F6F1E7]">
      <svg
        viewBox="0 0 600 440"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Stylized street map showing Collierville Alterations on West Poplar Avenue, across from Walmart"
      >
        <rect width="600" height="440" fill="#F6F1E7" />

        <g fill="#EDE5D7">
          <rect x="18" y="18" width="170" height="120" rx="3" />
          <rect x="214" y="18" width="140" height="120" rx="3" />
          <rect x="390" y="18" width="192" height="120" rx="3" />
          <rect x="18" y="238" width="170" height="80" rx="3" />
          <rect x="214" y="238" width="140" height="80" rx="3" />
          <rect x="390" y="238" width="192" height="80" rx="3" />
          <rect x="18" y="350" width="250" height="72" rx="3" />
          <rect x="310" y="350" width="272" height="72" rx="3" />
        </g>

        <g stroke="#FAF7F2" strokeLinecap="butt">
          <path d="M0 188H600" strokeWidth="30" />
          <path d="M0 330H600" strokeWidth="14" />
          <path d="M198 0V440" strokeWidth="14" />
          <path d="M372 0V440" strokeWidth="14" />
          <path d="M512 0V440" strokeWidth="10" />
        </g>

        <g stroke="#E3DBCC" strokeWidth="1">
          <path d="M0 173H600" />
          <path d="M0 203H600" />
          <path d="M192 0V440" />
          <path d="M204 0V440" />
          <path d="M366 0V440" />
          <path d="M378 0V440" />
        </g>

        <path d="M0 188H600" stroke="#B88E4A" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="10 14" />

        <g fill="#57534E" fillOpacity="0.5" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7" letterSpacing="1.7">
          <text x="34" y="182">W POPLAR AVE</text>
          <text x="386" y="222">SHELBY DR</text>
          <text x="222" y="324">WALNUT ST</text>
        </g>

        <g>
          <rect x="42" y="240" width="140" height="56" rx="2" fill="#E5DCCD" />
          <rect x="42" y="240" width="140" height="16" rx="2" fill="#DCD2C0" />
          <text
            x="112"
            y="272"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="7.5"
            letterSpacing="1.8"
            fill="#57534E"
            fillOpacity="0.7"
          >
            WALMART
          </text>
          <text
            x="112"
            y="285"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="6"
            letterSpacing="1"
            fill="#57534E"
            fillOpacity="0.4"
          >
            ACROSS THE STREET
          </text>
        </g>

        <g fill="#57534E" fillOpacity="0.28" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="6" letterSpacing="1.4">
          <text x="40" y="356">MUNICIPAL PARKING</text>
          <text x="330" y="356">OLD TOWN BLOCK</text>
        </g>

        <g transform="translate(438 268)">
          <circle r="34" fill="#B88E4A" opacity="0.1" className="map-pulse" />
          <circle r="23" fill="#B88E4A" opacity="0.1" />
          <path
            d="M0 -19c-9.4 0-17 7.6-17 17 0 12.7 17 25.4 17 25.4S17 10.7 17 -2c0-9.4-7.6-17-17-17Z"
            fill="#B88E4A"
          />
          <circle cy="-2.4" r="6.2" fill="#FAF7F2" />
        </g>
        <text
          x="438"
          y="312"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="7"
          letterSpacing="1.5"
          fill="#57534E"
          fillOpacity="0.65"
        >
          STUDIO · SUITE 1
        </text>

        <g transform="translate(548 46)" fill="none" stroke="#57534E" strokeOpacity="0.4" strokeWidth="1">
          <circle r="13" />
          <path d="M0 7V-9M-4 -4 0 -9l4 5" strokeLinecap="round" strokeLinejoin="round" />
          <text
            y="-18"
            textAnchor="middle"
            fill="#57534E"
            fillOpacity="0.6"
            stroke="none"
            fontSize="6.5"
            letterSpacing="1.4"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            N
          </text>
        </g>
      </svg>

      <div className="absolute left-4 top-4 max-w-[220px] rounded-[2px] border border-line bg-white/95 px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-brass">You’ll find us here</p>
        <p className="mt-1 text-[11.5px] font-medium leading-snug text-ink">
          567 W Poplar Ave, Suite 1
          <span className="block font-normal text-muted">Collierville, TN 38017</span>
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 border-t border-line bg-ivory/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <MapPin className="h-3.5 w-3.5 text-brass" />
          Across from Walmart on West Poplar
        </div>
        <a
          href={BUSINESS.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-brass hover:text-brass-dark"
        >
          <CompassIcon className="h-3.5 w-3.5" />
          Google Maps
        </a>
      </div>
    </div>
  );
}

export default function Visit() {
  const now = useCentralTime(60000);
  const today = centralParts(now).weekday;
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(BUSINESS.phone);
    } catch {
      const field = document.createElement('textarea');
      field.value = BUSINESS.phone;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      document.body.removeChild(field);
    }

    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section id="visit" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHead
              number="05"
              eyebrow="Visit the Studio"
              title={
                <>
                  On West Poplar, <em className="italic text-brass-dark">across from Walmart.</em>
                </>
              }
              copy="Park, walk in, bring the garment. A fitting is a conversation — and the kettle is usually on."
            />
          </Reveal>
          <Reveal delay={100}>
            <MiniStatus />
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-5" delay={80}>
            <div className="card h-full p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-brass-wash/50 text-brass-dark">
                  <MapPin className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                    The Studio
                  </p>
                  <p className="mt-1.5 font-display text-[23px] leading-tight text-ink">
                    {BUSINESS.street}
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted/80">{BUSINESS.note}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5 sm:flex-row">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 !px-4 !py-3 !text-[10px]"
                >
                  <CompassIcon className="h-3.5 w-3.5" />
                  Open in Google Maps
                </a>
                <button
                  type="button"
                  onClick={copyPhone}
                  className="btn-quiet flex-1 !py-3"
                  aria-live="polite"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  {copied ? 'Number copied!' : `Copy ${BUSINESS.phone}`}
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                    Weekly hours
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-brass-dark">
                    <ClockIcon className="h-3 w-3" />
                    Central Time
                  </span>
                </div>
                <div className="mt-3 overflow-hidden rounded-[2px] border border-line">
                  {HOURS.map((day) => {
                    const isToday = day.day === today;
                    return (
                      <div
                        key={day.day}
                        aria-current={isToday ? 'date' : undefined}
                        className={`flex items-center justify-between gap-4 border-b border-line/70 px-3.5 py-2.5 last:border-b-0 ${
                          isToday ? 'bg-brass-wash/35' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isToday ? (
                            <span className="h-1 w-1 rounded-full bg-brass" aria-hidden="true" />
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-transparent" aria-hidden="true" />
                          )}
                          <span
                            className={`text-[11.5px] ${
                              day.open ? 'font-medium text-ink' : 'text-muted/60'
                            }`}
                          >
                            {day.name}
                          </span>
                          {isToday && (
                            <span className="text-[7.5px] font-semibold uppercase tracking-[0.14em] text-brass-dark">
                              Today
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10.5px] tabular-nums ${
                            day.open ? 'text-muted' : 'text-muted/45'
                          }`}
                        >
                          {day.open ? '10:00 AM – 5:00 PM' : 'Closed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 text-[11.5px]">
                <a
                  href={BUSINESS.phoneHref}
                  className="flex items-center gap-2.5 text-ink transition-colors hover:text-brass-dark"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-brass" />
                  {BUSINESS.phone}
                </a>
                <a
                  href={BUSINESS.emailHref}
                  className="flex items-center gap-2.5 break-all text-muted transition-colors hover:text-brass-dark"
                >
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-brass" />
                  {BUSINESS.email}
                </a>
              </div>

              <div className="mt-5 flex gap-3 rounded-[3px] border border-dashed border-sage/35 bg-sage-wash/60 p-4">
                <CashIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sage">
                    Good to know · Cash-only studio
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                    Please come prepared — the studio does not take cards. Thank you for making the
                    pickup simple.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={160}>
            <div className="h-full">
              <StudioMap />
            </div>
          </Reveal>
        </div>
      </div>

      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="toast fixed bottom-24 left-1/2 z-50 flex items-center gap-2.5 rounded-full border border-brass/30 bg-ink px-5 py-3 text-[11px] font-medium tracking-wide text-linen shadow-lift sm:bottom-8"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-[8px]">✓</span>
          Number copied! · {BUSINESS.phone}
        </div>
      )}
    </section>
  );
}
