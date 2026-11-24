import { useCentralTime } from '../lib/useCentralTime';
import { centralClock, studioStatus } from '../lib/time';
import { BUSINESS } from '../data/content';
import {
  ArrowDown,
  ArrowRight,
  CashIcon,
  ClockIcon,
  MapPin,
  NeedleEmblem,
  PhoneIcon,
  ScissorsIcon,
  Stars,
} from './ui';

function LiveStatus({ now }) {
  const status = studioStatus(now);
  const isOpen = status.state === 'open';

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-silk/70 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted">
      <span className={`relative h-1.5 w-1.5 rounded-full ${isOpen ? 'live-dot bg-sage text-sage' : 'bg-muted/40'}`} />
      {isOpen ? 'Open now' : status.label}
    </span>
  );
}

export default function Hero({ onRequest }) {
  const now = useCentralTime(30000);
  const clock = centralClock(now);

  return (
    <section id="top" className="relative overflow-hidden">
      {/* backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-28 -top-40 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(184,142,74,0.12),transparent_64%)]" />
        <div className="absolute -left-40 top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(74,124,89,0.05),transparent_66%)]" />
        <span className="absolute -right-8 top-10 hidden select-none font-display text-[340px] leading-none text-ink/[0.022] lg:block">
          C
        </span>
        <svg
          viewBox="0 0 320 160"
          className="absolute bottom-4 right-4 hidden h-40 w-80 text-brass/25 lg:block"
          fill="none"
        >
          <path
            d="M14 146C52 120 44 84 88 74c42-10 52 22 92 14 34-7 44-42 82-48 16-2 30 2 44 10"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <circle cx="14" cy="146" r="2.4" fill="currentColor" />
        </svg>
      </div>

      <div className="shell relative grid gap-12 pb-16 pt-12 sm:pb-20 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7 lg:pr-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="h-1 w-1 rounded-full bg-brass" />
            <p className="eyebrow !text-[9.5px] !tracking-[0.24em]">
              Collierville, TN · Est. 2018 · 15+ Years of Master Tailoring
            </p>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.55rem,5.5vw,4.35rem)] font-normal leading-[1.03] tracking-[-0.02em] text-ink">
            Precision Alterations &amp;{' '}
            <em className="font-normal italic text-brass-dark">Bespoke Fit,</em>{' '}
            <span className="relative inline-block">
              Tailored to You.
              <svg
                aria-hidden="true"
                viewBox="0 0 260 10"
                className="absolute -bottom-2 left-0 h-2.5 w-full text-brass/45"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M2 6C64 2 190 9 258 4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 6" />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-[15px] leading-[1.75] text-muted sm:text-[16px]">
            From bridal gowns and prom dresses to custom suit tailoring and everyday hems—hand-pinned
            and finished with care by Kelly on West Poplar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={() => onRequest()} className="btn-primary">
              Request a Fitting
              <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#services" className="btn-ghost">
              Explore Services &amp; Turnaround
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-11 border-t border-line pt-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
              <div className="flex items-center gap-2.5">
                <Stars rating={4.6} className="h-3.5 w-3.5" />
                <p className="text-[11.5px] text-muted">
                  <span className="font-semibold text-ink">4.6 Google</span> · 42 reviews
                </p>
              </div>
              <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
              <div className="flex items-center gap-2.5">
                <Stars rating={5} className="h-3.5 w-3.5" />
                <p className="text-[11.5px] text-muted">
                  <span className="font-semibold text-ink">5.0 Yelp</span>
                </p>
              </div>
              <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                <ScissorsIcon className="h-3.5 w-3.5 text-brass" />
                Bridal, formal &amp; everyday wear
              </div>
            </div>
          </div>
        </div>

        {/* Atelier card */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[440px] lg:ml-auto lg:mt-2">
            <div
              aria-hidden="true"
              className="absolute -inset-2.5 rounded-[6px] border border-brass/20 sm:-inset-3"
            />
            <div className="card relative overflow-hidden shadow-card">
              <div className="m-2 border border-line/80 px-5 py-6 sm:px-7 sm:py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-brass">
                      The Atelier
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted/70">
                      No. 01 · West Poplar
                    </p>
                  </div>
                  <LiveStatus now={now} />
                </div>

                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[56px] leading-[0.85] tracking-[-0.02em] text-ink">
                      15<span className="text-brass">+</span>
                    </p>
                    <p className="mt-3 max-w-[12rem] text-[10px] font-medium uppercase leading-[1.6] tracking-[0.18em] text-muted">
                      Years of master tailoring on West Poplar
                    </p>
                  </div>
                  <NeedleEmblem className="mt-1 h-14 w-14 shrink-0 text-brass/80" />
                </div>

                <div className="my-6 h-px bg-line" />

                <dl className="space-y-4">
                  <div className="flex gap-3.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    <div>
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/70">
                        Studio
                      </dt>
                      <dd className="mt-1 text-[12.5px] leading-snug text-ink">
                        {BUSINESS.street}
                        <span className="block text-muted">
                          {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3.5">
                    <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    <div>
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/70">
                        Studio Hours
                      </dt>
                      <dd className="mt-1 text-[12.5px] leading-snug text-ink">
                        Tue &amp; Thu–Sat · 10 AM – 5 PM
                        <span className="block text-muted">Closed Sun, Mon &amp; Wed</span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3.5">
                    <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    <div>
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/70">
                        Call the Studio
                      </dt>
                      <dd className="mt-1 text-[12.5px] text-ink">
                        <a href={BUSINESS.phoneHref} className="transition-colors hover:text-brass-dark">
                          {BUSINESS.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-6 flex items-center gap-3 rounded-[2px] border border-dashed border-brass/35 bg-silk/60 px-3.5 py-3">
                  <CashIcon className="h-4 w-4 shrink-0 text-brass-dark" />
                  <p className="text-[10.5px] leading-snug text-muted">
                    <span className="font-semibold text-ink">Cash-only studio.</span> Come prepared —
                    thank you.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                  <span>Est. 2018</span>
                  <span className="h-px flex-1 bg-line" />
                  <span>Across from Walmart</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-muted/60 lg:text-right">
              {clock.dateLabel} · {clock.time} Central
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
