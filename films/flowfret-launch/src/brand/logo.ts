// The supplied logo, parsed into parts for LogoMark, AssembledMark and Lockup (written by scripts/brand.py
// from brand/logo/flowfret-mark.svg): cinetic:brand-supplied. Re-run brand.py to change it, never edit the paths.
import { type Logo, logoParts } from './Mark';

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#121212"/><rect x="8" y="8" width="48" height="48" rx="10" fill="#E11D48"/><path
    d="M32 14c-1.2 0-2.2.9-2.4 2.1l-.8 5.1c-3.7 1-6.5 4.3-6.5 8.3v10.5c0 1.1.9 2 2 2h2.2l1.1 8.2c.2 1.3 1.3 2.3 2.6 2.3h3.6c1.3 0 2.4-1 2.6-2.3l1.1-8.2H40c1.1 0 2-.9 2-2V29.5c0-4-2.8-7.3-6.5-8.3l-.8-5.1C34.2 14.9 33.2 14 32 14zm-4.7 17.6c0-2.6 2.1-4.7 4.7-4.7s4.7 2.1 4.7 4.7-.9 1.7-1.7 1.7-1.7-.8-1.7-1.7c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3c0 .9-.8 1.7-1.7 1.7s-1.7-.8-1.7-1.7z"
    fill="#FFFFFF"
  /><circle cx="32" cy="31.6" r="2.2" fill="#E11D48"/></svg>`;
export const LOGO = logoParts(LOGO_SVG, { split: 'leaves' });
export const LOGO_PARTS = ["p0", "p1", "p2", "p3"];
export const WORDMARK_SVG: string | null = null;
export const WORDMARK: Logo | null = null;
/** A raster logo is placed whole; none here: the logo is vector. */
export const LOGO_RASTER: string | null = null;

