import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { morphPath, useMorph, warpPath, warpPoint } from '../lib/morph';
import { BUSINESS } from '../data/content';
import { MODEL, TINTS, defaultValues, webglAvailable } from '../lib/garmentModel';
import { ArrowRight, PhoneIcon, Reveal, SectionHead } from './ui';

const Fit3D = lazy(() => import('./Fit3D'));

const GARMENTS = [
  {
    id: 'jacket',
    label: 'Suit Jacket',
    code: 'Fig. 01',
    modalValue: 'Suit or blazer',
    loose:
      'M 180 62 C 194 62 206 68 214 78 L 238 90 L 258 104 L 268 134 L 286 270 C 289 290 287 310 283 326 L 277 344 C 275 352 269 356 261 356 L 249 356 C 241 356 235 350 233 342 L 223 300 C 220 268 218 236 220 210 L 222 194 L 234 202 C 242 248 247 294 250 334 L 258 402 L 180 406',
    fit: 'M 180 62 C 194 62 206 68 213 77 L 233 88 L 252 102 L 261 130 L 279 264 C 281 284 279 304 275 320 L 268 338 C 266 346 260 350 253 350 L 244 350 C 237 350 232 345 230 338 L 221 296 C 218 264 216 234 218 208 L 220 193 L 226 200 C 230 244 232 288 234 328 L 240 396 L 180 398',
    details: [
      'M 180 68 L 198 120 L 180 192',
      'M 198 120 L 214 112',
      'M 238 92 C 231 130 227 164 224 194',
      'M 208 300 L 240 304',
      'M 240 104 C 238 168 242 250 238 336',
      'M 206 74 L 234 88',
    ],
    center: ['M 180 192 L 180 398'],
    buttons: [
      { x: 180, y: 240 },
      { x: 180, y: 274 },
    ],
    stitches: [
      'M 232 206 C 236 248 239 294 236 336',
      'M 256 106 C 260 188 261 266 254 336',
      'M 180 390 L 246 388',
      'M 196 70 L 234 88',
    ],
    pins: [
      {
        x: 239,
        y: 290,
        title: 'Waist Suppression',
        body: 'Side seams and the center back are taken in so the jacket follows your waist instead of hanging straight from the shoulders.',
      },
      {
        x: 259,
        y: 326,
        title: 'Sleeve Taper to Wrist',
        body: 'Sleeves are re-pitched and tapered so the cuff ends at the wrist bone, leaving a sliver of shirt cuff visible.',
      },
      {
        x: 226,
        y: 190,
        title: 'Shoulder & Armhole Balance',
        body: 'The shoulder line is leveled and the armhole adjusted so the jacket moves with you instead of lifting at the collar.',
      },
      {
        x: 240,
        y: 386,
        title: 'Hem & Button Stance',
        body: 'The hem is leveled, vents pressed and buttons reset so they sit at your natural waistline.',
      },
    ],
    offNotes: [
      'Shoulders that sit off your natural line',
      'Sleeves that swallow the shirt cuff',
      'A waist that gaps at the back',
    ],
    fitLead: 'Pinned on the body, then shaped at the bench.',
    fitCopy:
      'Kelly works the jacket inside out — opening seams, re-cutting and pressing as she goes. The result is a jacket that moves with you, not one you move around.',
  },
  {
    id: 'gown',
    label: 'Bridal Gown',
    code: 'Fig. 02',
    modalValue: 'Bridal & formal gown',
    loose:
      'M 180 56 C 192 56 202 62 207 74 L 213 96 C 224 112 227 132 225 150 C 223 168 218 184 215 200 C 212 214 211 224 210 232 C 220 268 238 330 254 382 C 262 408 270 432 278 448 L 281 454 L 180 458',
    fit: 'M 180 56 C 192 56 202 62 207 74 L 212 96 C 222 112 224 132 221 150 C 218 168 212 184 208 200 C 205 212 203 221 202 228 C 212 266 232 328 248 382 C 256 408 264 428 272 440 L 275 446 L 180 448',
    details: [
      'M 207 72 L 204 96',
      'M 180 232 L 211 231',
      'M 204 242 C 212 302 222 372 230 444',
      'M 210 158 L 220 184',
    ],
    center: ['M 162 82 C 168 92 174 100 180 100 C 186 100 192 92 198 82'],
    buttons: [],
    stitches: [
      'M 212 214 C 209 220 207 226 206 232',
      'M 221 152 C 217 170 212 186 208 200',
      'M 180 438 C 220 436 252 434 274 434',
      'M 246 398 C 262 406 268 424 258 434',
    ],
    pins: [
      {
        x: 252,
        y: 416,
        title: 'Bridal Bustle & Hem',
        body: 'The hem is cut to your shoe height and a hidden bustle is built so the train can be lifted cleanly for the reception.',
      },
      {
        x: 204,
        y: 212,
        title: 'Bust & Waist Suppression',
        body: 'Princess and side seams are refined through the bust and waist for support without compression.',
      },
      {
        x: 206,
        y: 88,
        title: 'Strap & Shoulder Adjustment',
        body: 'Straps are shortened or repositioned and cups can be added so the bodice holds its own shape.',
      },
      {
        x: 230,
        y: 322,
        title: 'Side Seam Refinement',
        body: 'Side seams are eased through the hip so the gown falls cleanly and the zipper lies flat.',
      },
    ],
    offNotes: [
      'A hem that pools at your shoes',
      'A bodice that gaps at the bust',
      'A train with no way to bustle',
    ],
    fitLead: 'Bridal fit is its own discipline.',
    fitCopy:
      'The gown is pinned over the shoes and undergarments you will actually wear. Bustle points are placed so the train can be lifted cleanly and the bodice stays where it should.',
  },
  {
    id: 'trousers',
    label: 'Trousers',
    code: 'Fig. 03',
    modalValue: 'Pants, jeans or hems',
    loose:
      'M 180 84 L 234 90 C 242 96 245 108 246 124 L 250 200 C 252 250 256 300 258 340 L 262 416 C 262 422 258 426 250 426 L 220 426 C 212 426 208 422 208 416 L 202 330 C 200 300 197 280 194 262 L 186 238 L 180 234',
    fit: 'M 180 84 L 226 90 C 234 96 237 108 238 124 L 242 200 C 244 250 248 300 250 340 L 252 408 C 252 414 248 418 240 418 L 216 418 C 209 418 205 414 205 408 L 199 328 C 197 300 195 280 192 262 L 185 238 L 180 234',
    details: [
      'M 180 102 L 236 107',
      'M 204 108 C 212 116 216 124 218 136',
      'M 228 150 L 234 404',
      'M 194 102 L 194 110',
      'M 210 104 L 210 112',
      'M 226 106 L 226 114',
      'M 208 338 C 205 356 202 394 201 416',
    ],
    center: ['M 180 106 C 180 130 182 146 186 160 C 190 172 192 182 192 192'],
    buttons: [],
    stitches: [
      'M 238 106 C 242 112 243 118 242 124',
      'M 242 200 C 245 254 248 300 250 338',
      'M 205 408 L 252 408',
      'M 238 160 C 233 172 231 182 232 192',
    ],
    pins: [
      {
        x: 232,
        y: 112,
        title: 'Waist Suppression',
        body: 'The waistband is taken in at the center back and side seams for a clean, no-belt fit that still lets you sit.',
      },
      {
        x: 247,
        y: 300,
        title: 'Taper Through Thigh & Knee',
        body: 'The leg is tapered from thigh to knee to remove excess fabric and create one clean line to the shoe.',
      },
      {
        x: 248,
        y: 402,
        title: 'Original Denim Hem',
        body: 'Denim hems are reattached with the original stitching and faded edge preserved for a factory-finished look.',
      },
      {
        x: 228,
        y: 186,
        title: 'Seat & Rise Adjustment',
        body: 'The rise and seat are balanced so the trouser sits at your natural waist and moves without pulling.',
      },
    ],
    offNotes: [
      'A waist that needs a belt to stay put',
      'A leg that breaks and pools at the shoe',
      'A rise that pulls when you sit',
    ],
    fitLead: 'Small changes, a different posture.',
    fitCopy:
      'Waist, seat and hem are balanced together so the trouser sits at your natural waist and falls cleanly — including denim, where the original hem is preserved.',
  },
];

function FitSwitch({ fitted, onChange }) {
  return (
    <div
      className="relative flex w-full rounded-full border border-line bg-silk p-1 sm:w-[300px]"
      role="group"
      aria-label="Choose fit view"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-brass shadow-[0_4px_10px_-4px_rgba(158,118,54,0.9)] transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          fitted ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        aria-pressed={!fitted}
        onClick={() => onChange(false)}
        className={`relative z-10 flex-1 rounded-full px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.11em] transition-colors duration-300 ${
          !fitted ? 'text-linen' : 'text-muted hover:text-ink'
        }`}
      >
        Off-the-Rack
      </button>
      <button
        type="button"
        aria-pressed={fitted}
        onClick={() => onChange(true)}
        className={`relative z-10 flex-1 rounded-full px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.11em] transition-colors duration-300 ${
          fitted ? 'text-linen' : 'text-muted hover:text-ink'
        }`}
      >
        Kelly&rsquo;s Custom Fit
      </button>
    </div>
  );
}

function ModelSlider({ control, value, onChange, disabled }) {
  const pct = Math.round(value * 100);
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink">
        {control.label}
        <span className="font-normal normal-case tracking-normal text-muted/60">{pct}%</span>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={pct}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        aria-valuetext={`${pct} percent, from ${control.low} to ${control.high}`}
        className="mt-2 h-1.5 w-full cursor-pointer accent-brass disabled:cursor-not-allowed disabled:opacity-35"
      />
      <span className="mt-1 flex justify-between text-[9px] text-muted/60">
        <span>{control.low}</span>
        <span>{control.high}</span>
      </span>
    </label>
  );
}

function ViewToggle({ view, onChange }) {
  const base =
    'rounded-full px-3 py-1.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300';
  return (
    <div
      className="inline-flex rounded-full border border-line bg-white/70 p-0.5"
      role="group"
      aria-label="Choose view"
    >
      {[
        ['3d', '3D model'],
        ['diagram', 'Diagram'],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={view === id}
          onClick={() => onChange(id)}
          className={`${base} ${view === id ? 'bg-ink text-linen' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function FitVisualizer({ onRequest }) {
  const [garmentId, setGarmentId] = useState('jacket');
  const [fitted, setFitted] = useState(false);
  const [activePin, setActivePin] = useState(0);
  const [view, setView] = useState('3d');
  const [glSupported] = useState(() => typeof document !== 'undefined' && webglAvailable());
  const [glFailed, setGlFailed] = useState(false);
  const [near, setNear] = useState(false);
  const [custom, setCustom] = useState({});
  const [tints, setTints] = useState({});
  const sectionRef = useRef(null);

  const t = useMorph(fitted, 950);
  const garment = GARMENTS.find((item) => item.id === garmentId) || GARMENTS[0];
  const pin = garment.pins[activePin] || garment.pins[0];

  const outline = morphPath(garment.loose, garment.fit, t);
  const fill = `${outline} Z`;

  /* Detail lines are drawn on the loose shape; warp them so they ride the outline as it morphs. */
  const warped = useMemo(
    () => ({
      details: garment.details.map((d) => warpPath(d, garment.loose, garment.fit)),
      center: garment.center.map((d) => warpPath(d, garment.loose, garment.fit)),
      buttons: garment.buttons.map((b) => {
        const [x, y] = warpPoint(b.x, b.y, garment.loose, garment.fit);
        return { x, y };
      }),
    }),
    [garment],
  );

  const show3d = view === '3d' && glSupported && !glFailed;
  const values = custom[garmentId] || defaultValues(garmentId);
  const tintId = tints[garmentId] || MODEL[garmentId].defaultTint;
  const defaults = defaultValues(garmentId);
  const modified = MODEL[garmentId].controls.some((c) => Math.abs(values[c.key] - defaults[c.key]) > 0.004);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || near) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);

  const setValue = (key, next) =>
    setCustom((current) => ({
      ...current,
      [garmentId]: { ...(current[garmentId] || defaultValues(garmentId)), [key]: next },
    }));

  const requestNotes = () => {
    if (!show3d || !modified) return '';
    const tint = TINTS.find((item) => item.id === tintId)?.label;
    const parts = MODEL[garmentId].controls.map(
      (c) => `${c.label} ${Math.round(values[c.key] * 100)}%`,
    );
    return `Fit preferences from the 3D model (${garment.label}, ${tint}): ${parts.join(', ')}.`;
  };

  const tabRefs = useRef({});
  const pinCount = garment.pins.length;
  const stepPin = (delta) => setActivePin((current) => (current + delta + pinCount) % pinCount);

  const chooseGarment = (id) => {
    setGarmentId(id);
    setActivePin(0);
  };

  const onTabKeyDown = (event, index) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const move = keys[event.key];
    let next;
    if (move === 'first') next = 0;
    else if (move === 'last') next = GARMENTS.length - 1;
    else next = (index + move + GARMENTS.length) % GARMENTS.length;
    chooseGarment(GARMENTS[next].id);
    tabRefs.current[GARMENTS[next].id]?.focus();
  };

  return (
    <section ref={sectionRef} id="visualizer" className="relative scroll-mt-24 border-y border-line/70 bg-silk/50 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            number="02"
            eyebrow="Off-the-Rack vs. Tailored"
            title={
              <>
                The difference is in the <em className="italic text-brass-dark">pinning.</em>
              </>
            }
            copy="Switch between a garment cut to an average and the same garment cut to you. Toggle Kelly’s custom fit, then tap a pin to see exactly what changes."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 overflow-hidden rounded-[4px] border border-line bg-ivory shadow-card lg:mt-14">
            <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
              <div
                className="flex gap-1.5 overflow-x-auto pb-0.5"
                role="tablist"
                aria-label="Garment silhouettes"
              >
                {GARMENTS.map((item, tabIndex) => {
                  const active = item.id === garmentId;
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        tabRefs.current[item.id] = node;
                      }}
                      id={`fit-tab-${item.id}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="fit-panel"
                      tabIndex={active ? 0 : -1}
                      onKeyDown={(event) => onTabKeyDown(event, tabIndex)}
                      onClick={() => chooseGarment(item.id)}
                      className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] transition-all duration-300 ${
                        active
                          ? 'bg-ink text-linen shadow-[0_6px_16px_-10px_rgba(26,28,32,0.8)]'
                          : 'text-muted hover:bg-silk hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <FitSwitch
                fitted={fitted}
                onChange={(next) => {
                  setFitted(next);
                  if (next) setActivePin(0);
                }}
              />
            </div>

            <div
              id="fit-panel"
              role="tabpanel"
              aria-labelledby={`fit-tab-${garment.id}`}
              className="grid lg:grid-cols-[1.02fr_1fr]"
            >
              <div className="relative border-b border-line bg-[#FCFAF6] p-4 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-start justify-between gap-4 text-[8px] font-semibold uppercase tracking-[0.2em] text-muted/45">
                  <span>
                    {garment.code} / {garment.label}
                  </span>
                  <span className="text-right">
                    {show3d ? 'Illustrative 3D model' : 'Hand-pinned · not to scale'}
                  </span>
                </div>

                {glSupported && !glFailed && (
                  <div className="mt-3 flex justify-center">
                    <ViewToggle view={view} onChange={setView} />
                  </div>
                )}

                {show3d &&
                  (near ? (
                    <Suspense
                      fallback={
                        <div className="mx-auto mt-1 flex aspect-[4/5] w-full max-w-[420px] items-center justify-center text-[10px] uppercase tracking-[0.16em] text-muted/50">
                          Loading model
                        </div>
                      }
                    >
                      <Fit3D
                        garmentId={garmentId}
                        garmentLabel={garment.label}
                        values={values}
                        t={t}
                        tintId={tintId}
                        fitted={fitted}
                        pins={garment.pins}
                        activePin={activePin}
                        onPin={setActivePin}
                        onError={() => setGlFailed(true)}
                      />
                    </Suspense>
                  ) : (
                    <div className="mx-auto mt-1 aspect-[4/5] w-full max-w-[420px]" />
                  ))}

                {!show3d && (
                <svg
                  viewBox="0 0 360 500"
                  className={`mx-auto mt-1 h-auto w-full max-w-[400px] ${fitted ? 'is-fitted' : ''}`}
                  role="img"
                  aria-label={`${garment.label} illustration showing ${
                    fitted ? 'a custom tailored fit with numbered alteration pins' : 'an off-the-rack fit'
                  }`}
                >
                  <defs>
                    <pattern id="fit-dotgrid" width="18" height="18" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.9" fill="#1A1C20" fillOpacity="0.07" />
                    </pattern>
                  </defs>

                  <rect x="0" y="0" width="360" height="500" fill="url(#fit-dotgrid)" />
                  <line
                    x1="180"
                    y1="28"
                    x2="180"
                    y2="478"
                    stroke="#B88E4A"
                    strokeOpacity="0.22"
                    strokeDasharray="2 6"
                  />
                  <line
                    x1="22"
                    y1="232"
                    x2="338"
                    y2="232"
                    stroke="#57534E"
                    strokeOpacity="0.12"
                    strokeDasharray="3 7"
                  />
                  <text x="24" y="226" fontSize="6.5" letterSpacing="1.6" fill="#57534E" fillOpacity="0.4">
                    WAIST LINE
                  </text>

                  <g key={garment.id} className="garment-swap">
                    <g
                      fill="none"
                      stroke="#57534E"
                      strokeWidth="1.1"
                      strokeDasharray="3 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity={0.4 * t}
                      aria-hidden="true"
                    >
                      <path d={garment.loose} />
                      <g transform="translate(360 0) scale(-1 1)">
                        <path d={garment.loose} />
                      </g>
                    </g>

                    <g className="garment-fill" stroke="none">
                      <path d={fill} />
                      <g transform="translate(360 0) scale(-1 1)">
                        <path d={fill} />
                      </g>
                    </g>

                    <g
                      fill="none"
                      stroke="#1A1C20"
                      strokeOpacity="0.82"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={outline} />
                      <g transform="translate(360 0) scale(-1 1)">
                        <path d={outline} />
                      </g>
                    </g>

                    <g
                      fill="none"
                      stroke="#1A1C20"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {garment.details.map((d, index) => (
                        <path key={`d-${index}`} d={morphPath(d, warped.details[index], t)} />
                      ))}
                      <g transform="translate(360 0) scale(-1 1)">
                        {garment.details.map((d, index) => (
                          <path key={`dm-${index}`} d={morphPath(d, warped.details[index], t)} />
                        ))}
                      </g>
                      {garment.center.map((d, index) => (
                        <path key={`c-${index}`} d={morphPath(d, warped.center[index], t)} />
                      ))}
                      {garment.buttons.map((button, index) => (
                        <circle
                          key={`b-${index}`}
                          cx={button.x + (warped.buttons[index].x - button.x) * t}
                          cy={button.y + (warped.buttons[index].y - button.y) * t}
                          r="2.1"
                          fill="#B88E4A"
                          stroke="none"
                        />
                      ))}
                    </g>

                    <g
                      fill="none"
                      stroke="#B88E4A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="stitch-draw"
                    >
                      {garment.stitches.map((d, index) => (
                        <path key={`s-${index}`} d={d} />
                      ))}
                      <g transform="translate(360 0) scale(-1 1)">
                        {garment.stitches.map((d, index) => (
                          <path key={`sm-${index}`} d={d} />
                        ))}
                      </g>
                    </g>

                    {garment.pins.map((item, index) => (
                      <g key={item.title} transform={`translate(${item.x} ${item.y})`}>
                        <g
                          className={`pin ${fitted ? 'is-on' : ''}`}
                          data-active={activePin === index}
                          style={{ transitionDelay: fitted ? `${index * 90}ms` : '0ms' }}
                          role="button"
                          tabIndex={fitted ? 0 : -1}
                          aria-hidden={!fitted}
                          aria-pressed={activePin === index}
                          aria-label={`Pin ${index + 1}: ${item.title}`}
                          onClick={() => setActivePin(index)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setActivePin(index);
                            }
                          }}
                        >
                          <title>{item.title}</title>
                          <circle r="18" fill="transparent" />
                          <circle
                            className="pin-ring"
                            r="12.5"
                            fill="#B88E4A"
                            fillOpacity="0.16"
                            stroke="#B88E4A"
                            strokeOpacity="0.45"
                          />
                          <circle r="7.2" fill="#B88E4A" stroke="#FAF7F2" strokeWidth="1.6" />
                          <text
                            y="2.6"
                            textAnchor="middle"
                            fontSize="7.5"
                            fontWeight="600"
                            fill="#FAF7F2"
                            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                          >
                            {index + 1}
                          </text>
                        </g>
                      </g>
                    ))}
                  </g>
                </svg>
                )}

                <p className="mt-1 text-center text-[9.5px] uppercase tracking-[0.14em] text-muted/55">
                  {fitted ? 'Tap a numbered pin to read the alteration' : 'Switch to custom fit to reveal the pins'}
                </p>
                {!show3d && (
                <p
                  className={`mt-1.5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-muted/55 transition-opacity duration-500 ${
                    fitted ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                >
                  <svg width="22" height="4" viewBox="0 0 22 4">
                    <line x1="0" y1="2" x2="22" y2="2" stroke="#57534E" strokeOpacity="0.55" strokeDasharray="3 4" />
                  </svg>
                  Dashed line = the off-the-rack outline
                </p>
                )}

                {show3d && (
                  <div className="mt-5 rounded-[2px] border border-line bg-white/70 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brass-dark">
                        Customize the fit
                      </p>
                      <button
                        type="button"
                        onClick={() => setCustom((current) => ({ ...current, [garmentId]: undefined }))}
                        disabled={!modified}
                        className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink disabled:opacity-30"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted/70" id="fabric-label">
                        Fabric
                      </p>
                      <div role="radiogroup" aria-labelledby="fabric-label" className="flex flex-wrap gap-2">
                        {TINTS.map((tint) => {
                          const active = tint.id === tintId;
                          return (
                            <button
                              key={tint.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              aria-label={tint.label}
                              title={tint.label}
                              onClick={() => setTints((current) => ({ ...current, [garmentId]: tint.id }))}
                              className={`h-6 w-6 rounded-full border border-black/10 transition-shadow ${
                                active ? 'ring-2 ring-brass ring-offset-2 ring-offset-white' : 'hover:ring-2 hover:ring-brass/40'
                              }`}
                              style={{ backgroundColor: tint.color }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className={`mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 ${fitted ? '' : 'opacity-60'}`}
                    >
                      {MODEL[garmentId].controls.map((control) => (
                        <ModelSlider
                          key={control.key}
                          control={control}
                          value={values[control.key]}
                          disabled={!fitted}
                          onChange={(next) => setValue(control.key, next)}
                        />
                      ))}
                    </div>

                    {!fitted && (
                      <p className="mt-4 text-[10px] leading-relaxed text-muted/70">
                        Switch to Kelly&rsquo;s custom fit to adjust the sliders.{' '}
                        <button
                          type="button"
                          onClick={() => setFitted(true)}
                          className="font-semibold text-brass-dark underline underline-offset-2"
                        >
                          Switch now
                        </button>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col p-6 sm:p-8">
                <p className="eyebrow">{fitted ? "Kelly’s Custom Fit" : 'Off-the-Rack'}</p>
                <h3 className="mt-3 font-display text-[26px] leading-tight text-ink sm:text-[29px]">
                  {fitted ? garment.fitLead : 'Average is not a fit.'}
                </h3>

                {!fitted ? (
                  <>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted">
                      Factory sizing is drafted to an average body — a little long here, a little
                      generous there. The garment almost works, which is exactly why it never feels
                      finished.
                    </p>
                    <ul className="mt-6 space-y-3 border-t border-line pt-6">
                      {garment.offNotes.map((note) => (
                        <li key={note} className="flex gap-3 text-[12.5px] leading-snug text-muted">
                          <span className="mt-1 block h-2.5 w-px bg-muted/40" aria-hidden="true" />
                          {note}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        onClick={() => setFitted(true)}
                        className="btn-primary w-full sm:w-auto"
                      >
                        Show me Kelly&rsquo;s custom fit
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="mt-3 text-[10px] leading-relaxed text-muted/70">
                        Four pin points. One garment that finally fits.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted">{garment.fitCopy}</p>

                    <div
                      className="mt-5 rounded-[2px] border border-brass/25 bg-silk/45 p-4"
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brass text-[10px] font-semibold text-linen">
                          {activePin + 1}
                        </span>
                        <p className="flex-1 text-[12.5px] font-semibold text-ink">{pin.title}</p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => stepPin(-1)}
                            aria-label="Previous pin"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brass/50 hover:text-ink"
                          >
                            <ArrowRight className="h-3 w-3 rotate-180" />
                          </button>
                          <button
                            type="button"
                            onClick={() => stepPin(1)}
                            aria-label="Next pin"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brass/50 hover:text-ink"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2.5 text-[12px] leading-relaxed text-muted">{pin.body}</p>
                    </div>

                    <div className="mt-4 space-y-px">
                      {garment.pins.map((item, index) => {
                        const active = activePin === index;
                        return (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setActivePin(index)}
                            aria-pressed={active}
                            className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-all duration-300 ${
                              active
                                ? 'border-brass bg-silk/60 text-ink'
                                : 'border-transparent text-muted hover:border-brass/40 hover:bg-silk/30 hover:text-ink'
                            }`}
                          >
                            <span
                              className={`font-display text-[10px] italic ${
                                active ? 'text-brass' : 'text-muted/50'
                              }`}
                            >
                              0{index + 1}
                            </span>
                            <span className="flex-1 text-[11.5px] font-medium">{item.title}</span>
                            <span
                              className={`h-1 w-1 rounded-full transition-colors ${
                                active ? 'bg-brass' : 'bg-transparent'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-auto flex flex-col gap-2.5 pt-7 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => onRequest?.({ garment: garment.modalValue, notes: requestNotes() })}
                        className="btn-primary !px-5 !py-3 !text-[10px]"
                      >
                        Request this fitting
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={BUSINESS.phoneHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-brass-dark"
                      >
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {BUSINESS.phone}
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p className="mt-5 text-center text-[9.5px] uppercase tracking-[0.16em] text-muted/50">
            Illustrative fit diagrams · every alteration is pinned to your body, never to a template
          </p>
        </Reveal>
      </div>
    </section>
  );
}
