import { BUSINESS } from '../data/content';
import { ArrowRight, CashIcon, MailIcon, MapPin, NeedleEmblem, PhoneIcon } from './ui';

const EXPLORE = [
  { href: '#services', label: 'Garment Guide' },
  { href: '#visualizer', label: 'Fit Visualizer' },
  { href: '#process', label: 'Atelier Process' },
  { href: '#reviews', label: 'Local Reviews' },
  { href: '#visit', label: 'Visit & Hours' },
];

export default function Footer({ onRequest }) {
  return (
    <footer className="relative overflow-hidden bg-ink text-linen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,142,74,0.14),transparent_66%)]" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(74,124,89,0.1),transparent_68%)]" />
      </div>

      <div className="shell relative pb-24 pt-12 sm:pb-0 sm:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <NeedleEmblem className="h-10 w-10 text-brass-light" />
              <p className="font-display text-[21px] leading-none text-linen">
                Collierville <em className="font-normal italic text-brass-light">Alterations</em>
              </p>
            </div>
            <p className="mt-5 max-w-xs text-[12px] leading-relaxed text-linen/55">
              A modern tailor atelier on West Poplar. Bridal, formal and everyday alterations —
              hand-pinned by Kelly with fifteen-plus years at the bench.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-linen/70">
              <CashIcon className="h-3.5 w-3.5 text-brass-light" />
              Cash-only studio
            </div>
            <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-linen/35">
              Alterations · Collierville, TN · Est. 2018
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brass-light/80">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[11.5px] text-linen/55 transition-colors hover:text-linen"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brass-light/80">
              The Studio
            </p>
            <address className="mt-4 space-y-2.5 not-italic text-[11.5px] leading-relaxed text-linen/55">
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-light/70" />
                <span>
                  {BUSINESS.street}
                  <br />
                  {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                </span>
              </p>
              <p className="flex gap-2.5">
                <PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-light/70" />
                <a href={BUSINESS.phoneHref} className="transition-colors hover:text-linen">
                  {BUSINESS.phone}
                </a>
              </p>
              <p className="flex gap-2.5">
                <MailIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-light/70" />
                <a
                  href={BUSINESS.emailHref}
                  className="break-all transition-colors hover:text-linen"
                >
                  {BUSINESS.email}
                </a>
              </p>
            </address>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-light transition-colors hover:text-linen"
            >
              Open in Google Maps
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brass-light/80">
              Hours
            </p>
            <div className="mt-4 space-y-1.5 text-[11.5px] text-linen/55">
              <p className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                <span>Tue · Thu · Fri · Sat</span>
                <span className="tabular-nums text-linen/80">10 – 5</span>
              </p>
              <p className="flex justify-between gap-3">
                <span>Sun · Mon · Wed</span>
                <span className="text-linen/35">Closed</span>
              </p>
            </div>
            <button type="button" onClick={() => onRequest()} className="btn-primary mt-6 w-full !py-3">
              Request a Fitting
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <p className="mt-3 text-[9.5px] leading-relaxed text-linen/35">
              Bridal work is best started 6–8 weeks before the event.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-[9.5px] text-linen/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Collierville Alterations. All rights reserved.</p>
          <p className="max-w-xl leading-relaxed sm:text-right">
            Wedding dress alterations Collierville TN · Suit tailoring · Jeans &amp; hems · Zipper
            repair · 567 W Poplar Ave
          </p>
        </div>
      </div>
    </footer>
  );
}
