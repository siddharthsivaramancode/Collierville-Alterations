import { useEffect, useRef, useState } from 'react';

const NUMBER = /-?\d+(?:\.\d+)?/g;

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolates two SVG path strings that share the same command structure.
 * Falls back to the target path if the structures do not line up.
 */
export function morphPath(from, to, t) {
  if (!from || !to) return to || from || '';
  if (t <= 0) return from;
  if (t >= 1) return to;

  const fromNumbers = from.match(NUMBER);
  const toNumbers = to.match(NUMBER);

  if (!fromNumbers || !toNumbers || fromNumbers.length !== toNumbers.length) {
    return to;
  }

  let index = 0;
  return from.replace(NUMBER, () => {
    const a = Number(fromNumbers[index]);
    const b = Number(toNumbers[index]);
    index += 1;
    return (a + (b - a) * t).toFixed(2);
  });
}

function coordPairs(path) {
  const nums = (path.match(NUMBER) || []).map(Number);
  const out = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([nums[i], nums[i + 1]]);
  return out;
}

/**
 * Moves a point along with the loose -> fit change of a garment outline. Each
 * outline control point nudges nearby points by its own displacement, with a
 * soft falloff so points far from the edge stay put.
 */
export function warpPoint(x, y, loose, fit, sigma = 34) {
  const a = coordPairs(loose);
  const b = coordPairs(fit);
  if (a.length !== b.length) return [x, y];
  let dx = 0;
  let dy = 0;
  let weight = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d2 = (a[i][0] - x) ** 2 + (a[i][1] - y) ** 2;
    const w = Math.exp(-d2 / (2 * sigma * sigma));
    dx += w * (b[i][0] - a[i][0]);
    dy += w * (b[i][1] - a[i][1]);
    weight += w;
  }
  const k = 1 / (weight + 0.2);
  return [x + dx * k, y + dy * k];
}

/** Returns `path` re-drawn so it follows the garment's loose -> fit change. */
export function warpPath(path, loose, fit) {
  const nums = (path.match(NUMBER) || []).map(Number);
  const out = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push(...warpPoint(nums[i], nums[i + 1], loose, fit));
  let index = 0;
  return path.replace(NUMBER, () => out[index++].toFixed(2));
}

export function useMorph(active, duration = 900) {
  const target = active ? 1 : 0;
  const valueRef = useRef(target);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const from = valueRef.current;
    const to = active ? 1 : 0;

    if (from === to) return undefined;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      valueRef.current = to;
      setValue(to);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (to - from) * easeInOutCubic(progress);
      valueRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, duration]);

  return value;
}
