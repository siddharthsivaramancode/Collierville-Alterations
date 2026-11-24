import { useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Scroll reveal                                                      */
/* ------------------------------------------------------------------ */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Needle & thread emblem                                             */
/* ------------------------------------------------------------------ */
export function NeedleEmblem({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 44 44" className={className} fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="20.4" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.9" />
      <circle cx="22" cy="22" r="17.4" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.8" />
      <path
        d="M29.6 10.2 14.8 25a2.55 2.55 0 0 0 3.6 3.6L33.2 13.8"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.6 10.2 32 7.8a1.35 1.35 0 0 1 1.9 1.9l-2.4 2.4a1.35 1.35 0 0 1-1.9 0l-.3-.3a1.35 1.35 0 0 1 0-1.9Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="32.6" cy="10.4" r="0.85" fill="currentColor" />
      <path
        d="M33.4 15.4c3.9 3 3.9 7.6-.6 9.8-3.6 1.8-8.1 2.1-9.3 5.8-.5 1.6.4 2.6 1.5 2.4"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeDasharray="2.6 2.8"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Stitch divider                                                     */
/* ------------------------------------------------------------------ */
export function StitchDivider({ className = '' }) {
  return (
    <div aria-hidden="true" className={`shell ${className}`}>
      <svg viewBox="0 0 1200 26" className="h-[26px] w-full" fill="none" preserveAspectRatio="none">
        <path d="M0 13H548" stroke="#B88E4A" strokeOpacity="0.55" strokeWidth="1.1" className="stitch-path" />
        <path d="M652 13H1200" stroke="#B88E4A" strokeOpacity="0.55" strokeWidth="1.1" className="stitch-path" />
        <path d="M600 4.5 608.5 13 600 21.5 591.5 13Z" stroke="#B88E4A" strokeWidth="1" />
        <path d="M600 0v26" stroke="#B88E4A" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="578" cy="13" r="1.6" fill="#B88E4A" fillOpacity="0.55" />
        <circle cx="622" cy="13" r="1.6" fill="#B88E4A" fillOpacity="0.55" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/* ------------------------------------------------------------------ */
export function SectionHead({ eyebrow, number, title, copy, align = 'left', className = '' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      <div
        className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : 'justify-start'}`}
      >
        {number && (
          <span className="font-display text-[12px] italic tracking-wide text-brass/80">{number}</span>
        )}
        <span className="h-px w-8 bg-brass/40" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="mt-5 font-display text-[clamp(1.9rem,3.5vw,3rem)] leading-[1.06] tracking-[-0.015em] text-ink">
        {title}
      </h2>
      {copy && (
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted sm:text-[15px]">
          {copy}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stars                                                              */
/* ------------------------------------------------------------------ */
function StarShape({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.6l2.86 6.2 6.78.72-5.05 4.55 1.42 6.66L12 17.4l-6.01 3.33 1.42-6.66L2.36 9.52l6.78-.72L12 2.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Stars({ rating = 5, className = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-brass" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className={`relative inline-block ${className}`}>
            <StarShape className={`${className} text-brass/20`} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarShape className={`${className} text-brass`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const iconBase = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function ArrowRight({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M4 10h11" />
      <path d="M11 6l4 4-4 4" />
    </svg>
  );
}

export function ArrowDown({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M10 4v11" />
      <path d="M6 11l4 4 4-4" />
    </svg>
  );
}

export function Check({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M4 10.5l3.6 3.6L16 5.6" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M5.2 3.5h2.1l1.1 3-1.6 1.2a10.6 10.6 0 0 0 5.5 5.5l1.2-1.6 3 1.1v2.1a1.8 1.8 0 0 1-2 1.8A13.7 13.7 0 0 1 3.4 5.5a1.8 1.8 0 0 1 1.8-2Z" />
    </svg>
  );
}

export function MapPin({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M10 17.5s5.4-4.8 5.4-9a5.4 5.4 0 1 0-10.8 0c0 4.2 5.4 9 5.4 9Z" />
      <circle cx="10" cy="8.4" r="1.9" />
    </svg>
  );
}

export function ClockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.2V10l2.6 1.7" />
    </svg>
  );
}

export function CashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <rect x="2.6" y="5" width="14.8" height="10" rx="1.4" />
      <circle cx="10" cy="10" r="2.3" />
      <path d="M5.4 7.6v.01M14.6 12.4v.01" />
    </svg>
  );
}

export function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <rect x="3" y="4.4" width="14" height="12.2" rx="1.4" />
      <path d="M3 8.2h14M6.6 2.8v3.2M13.4 2.8v3.2" />
    </svg>
  );
}

export function CopyIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <rect x="7" y="7" width="9.4" height="9.4" rx="1.2" />
      <path d="M13 4.6H5.2A1.2 1.2 0 0 0 4 5.8V13" />
    </svg>
  );
}

export function CompassIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <circle cx="10" cy="10" r="7" />
      <path d="M12.6 7.4 11.3 11.3 7.4 12.6l1.3-3.9 3.9-1.3Z" />
    </svg>
  );
}

export function MailIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <rect x="2.6" y="4.4" width="14.8" height="11.2" rx="1.4" />
      <path d="m3.4 5.6 6.6 4.8 6.6-4.8" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function ScissorsIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...iconBase}>
      <circle cx="5.6" cy="5.6" r="2.1" />
      <circle cx="5.6" cy="14.4" r="2.1" />
      <path d="M7.3 6.9 16 15M7.3 13.1 16 5" />
    </svg>
  );
}

/* Corner ticks used to frame a card with a tailor's touch */
export function CornerTicks({ className = '' }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className="absolute left-2.5 top-2.5 h-2.5 w-2.5 border-l border-t border-brass/50" />
      <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r border-t border-brass/50" />
      <span className="absolute bottom-2.5 left-2.5 h-2.5 w-2.5 border-b border-l border-brass/50" />
      <span className="absolute bottom-2.5 right-2.5 h-2.5 w-2.5 border-b border-r border-brass/50" />
    </span>
  );
}
