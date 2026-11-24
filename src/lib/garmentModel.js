/* Slider + swatch definitions for the 3D fit models. Kept free of three.js so the
 * main bundle can use it without loading the 3D engine. */

const lerp = (a, b, t) => a + (b - a) * t;

export const TINTS = [
  { id: 'charcoal', label: 'Charcoal', color: '#3C4047' },
  { id: 'navy', label: 'Navy', color: '#27384F' },
  { id: 'camel', label: 'Camel', color: '#B39469' },
  { id: 'ivory', label: 'Ivory', color: '#E9E1D1' },
  { id: 'sage', label: 'Sage', color: '#7E9181' },
  { id: 'wine', label: 'Wine', color: '#6E2F3A' },
];

/**
 * Slider definitions per garment. `loose` is the off-the-rack value,
 * `fit` is Kelly's default custom value. All sliders run 0..1.
 */
export const MODEL = {
  jacket: {
    defaultTint: 'charcoal',
    easeLoose: 0.062,
    easeFit: 0.02,
    camera: { y: 0.98, d: 3.75 },
    controls: [
      { key: 'waist', label: 'Waist shaping', low: 'Boxy', high: 'Shaped', loose: 0.08, fit: 0.84 },
      { key: 'sleeve', label: 'Sleeve length', low: 'Shorter', high: 'Longer', loose: 0.8, fit: 0.3 },
      { key: 'length', label: 'Jacket length', low: 'Shorter', high: 'Longer', loose: 1, fit: 0.45 },
    ],
  },
  gown: {
    defaultTint: 'ivory',
    easeLoose: 0.06,
    easeFit: 0.012,
    camera: { y: 0.82, d: 4.2 },
    controls: [
      { key: 'waist', label: 'Bodice & waist', low: 'Loose', high: 'Fitted', loose: 0.1, fit: 0.86 },
      { key: 'skirt', label: 'Skirt fullness', low: 'Slim', high: 'Full', loose: 0.72, fit: 0.55 },
      { key: 'hem', label: 'Hem length', low: 'Higher', high: 'Floor', loose: 1, fit: 0.35 },
      { key: 'train', label: 'Train length', low: 'None', high: 'Long', loose: 0.75, fit: 0.5 },
      { key: 'bustle', label: 'Bustle', low: 'Down', high: 'Up', loose: 0, fit: 1 },
    ],
  },
  trousers: {
    defaultTint: 'navy',
    easeLoose: 0.05,
    easeFit: 0.012,
    camera: { y: 0.7, d: 3.45 },
    controls: [
      { key: 'waist', label: 'Waist fit', low: 'Gapping', high: 'Fitted', loose: 0.05, fit: 0.86 },
      { key: 'taper', label: 'Leg taper', low: 'Straight', high: 'Tapered', loose: 0.08, fit: 0.62 },
      { key: 'hem', label: 'Hem length', low: 'Cropped', high: 'Pooling', loose: 1, fit: 0.62 },
    ],
  },
};

export function defaultValues(id) {
  const out = {};
  for (const c of MODEL[id].controls) out[c.key] = c.fit;
  return out;
}

/** Slider values blended between off-the-rack (t = 0) and the user's custom fit (t = 1). */
export function effective(id, values, t) {
  const def = MODEL[id];
  const vals = {};
  for (const c of def.controls) vals[c.key] = lerp(c.loose, values?.[c.key] ?? c.fit, t);
  return { vals, ease: lerp(def.easeLoose, def.easeFit, t) };
}

export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
