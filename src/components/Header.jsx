import { useEffect, useState } from 'react';
import { useCentralTime } from '../lib/useCentralTime';
import { centralClock, studioStatus } from '../lib/time';
import { BUSINESS } from '../data/content';
import { ArrowRight, CloseIcon, NeedleEmblem, PhoneIcon } from './ui';

const LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'visualizer', label: 'Fit Visualizer' },
  { id: 'process', label: 'Process' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'visit', label: 'Visit' },
];

function StatusPill({ compact = false }) {
  const now = useCentralTime(1000);
  const clock = centralClock(now);
  const status = studioStatus(now);
  const isOpen = status.state === 'open';

  return (
    <div
      className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-white/70 py-1.5 pl-3 pr-3.5 shadow-[0_1px_0_rgba(26,28,32,0.02)]"
      title={`${status.label} · ${status.detail}`}
    >
      <span
        className={`relative flex h-1.5 w-1.5 rounded-full ${
          isOpen ? 'live-dot bg-sage text-sage' : 'bg-muted/40'
        }`}
      >
        {isOpen && <span className="relative h-1.5 w-1.5 rounded-full bg-sage" />}
      </span>
      <span className="text-[10.5px] font-semibold tracking-[0.01em] text-ink">
        {status.label}
        {!compact && (
          <span className="hidden font-normal text-muted 2xl:inline"> · {status.detail}</span>
        )}
      </span>
      <span className="h-3 w-px bg-line" aria-hidden="true" />
      <span className="text-[10.5px] tabular-nums text-muted">
        {clock.time} <span className="text-[9px] tracking-[0.08em]">CT</span>
      </span>
    </div>
  );
}

export default function Header({ onRequest }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (window.scrollY < 280) setActiveId('');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.id)).filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-42% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openRequest = () => {
    setMenuOpen(false);
    onRequest();
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-line bg-linen/90 shadow-[0_10px_30px_-28px_rgba(26,28,32,0.4)] backdrop-blur-xl'
          : 'border-transparent bg-linen/70 backdrop-blur-md'
      }`}
    >
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-[12px] focus:text-linen"
      >
        Skip to content
      </a>

      <div className="shell flex h-[70px] items-center justify-between gap-5 lg:h-[76px]">
        <a href="#top" className="group flex shrink-0 items-center gap-3" aria-label="Collierville Alterations home">
          <NeedleEmblem className="h-9 w-9 text-brass transition-transform duration-500 group-hover:-rotate-6" />
          <span className="leading-none">
            <span className="block font-display text-[18px] tracking-[-0.01em] text-ink sm:text-[19.5px]">
              Collierville <em className="font-normal italic">Alterations</em>
            </span>
            <span className="mt-[7px] block text-[8px] font-semibold uppercase tracking-[0.3em] text-muted/80 sm:text-[8.5px]">
              Modern Tailor Atelier
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`relative whitespace-nowrap py-2 text-[12.5px] font-medium tracking-[0.01em] transition-colors ${
                activeId === link.id ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-brass transition-all duration-300 ${
                  activeId === link.id ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <StatusPill />
          </div>
          <button type="button" onClick={openRequest} className="btn-primary hidden whitespace-nowrap !px-6 !py-3 sm:inline-flex">
            Request a Fitting
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/60 text-ink transition-colors hover:border-brass/60 xl:hidden"
          >
            {menuOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <span className="flex flex-col items-center gap-[5px]">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-3 bg-brass" />
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[70px] z-40 overflow-y-auto border-t border-line bg-linen/[0.98] backdrop-blur-xl lg:top-[76px] xl:hidden"
        >
          <div className="shell flex min-h-full flex-col py-8">
            <nav className="flex flex-col divide-y divide-line/80" aria-label="Mobile">
              {LINKS.map((link, index) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-baseline justify-between py-4"
                >
                  <span className="font-display text-[26px] text-ink transition-colors group-hover:text-brass-dark">
                    {link.label}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-brass/70">
                    0{index + 1}
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-8 space-y-4">
              <StatusPill />
              <button type="button" onClick={openRequest} className="btn-primary w-full">
                Request a Fitting
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href={BUSINESS.phoneHref} className="btn-ghost w-full">
                <PhoneIcon className="h-4 w-4" />
                {BUSINESS.phone}
              </a>
            </div>

            <p className="mt-auto pt-10 text-[11px] leading-relaxed text-muted">
              {BUSINESS.addressLine}
              <br />
              Across from Walmart on West Poplar · Cash-only studio
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
