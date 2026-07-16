import type { NavItem, SocialLink } from '../types';

/** Global site facts. Verified sources: Solu1ions Brand Guidelines + solu1ions.com. */
export const SITE = {
  name: 'Solu1ions',
  legalName: 'Solu1ions Business Development',
  tagline: 'One partner. Every solution.',
  email: 'info@solu1ions.com',
  location: 'Damascus, Syria',
  url: 'https://solu1ions.com',
  founderQuote: '“If it’s legal, we can do it.”',
  founder: 'Kamal Kneider, Founder & CEO',
  // NOTE: add a verified phone number before launch — the brand PDF only
  // contains the stationery placeholder (+963 999 999 99), so it is omitted.
  phone: null as string | null,
} as const;

export const NAV_ITEMS: NavItem[] = [
  { index: '01', label: 'Home', href: '#home' },
  { index: '02', label: 'About', href: '#about' },
  { index: '03', label: 'Services', href: '#services' },
  { index: '04', label: 'Journey', href: '#journey' },
  { index: '05', label: 'Work', href: '#work' },
  { index: '06', label: 'Approach', href: '#approach' },
  { index: '07', label: 'Contact', href: '#contact' },
];

/** Verified handles only. Add more channels here once confirmed. */
export const SOCIALS: SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/solu1ions.bd' },
];

export const MARQUEE_WORDS = ['Strategy', 'Creativity', 'Technology', 'Execution', 'Growth'];
