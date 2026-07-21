import type { Testimonial } from '../types';

/**
 * TESTIMONIALS — verified client quotes only. Never publish fabricated
 * testimonials: while this array is empty the section renders the clearly
 * labelled sample set below so the composition can be reviewed.
 *
 * `initialX` / `initialY` / `initialRotation` are the desktop scatter preset
 * (drag-layer pixels, top-left origin). Keep the X values roughly 400px apart
 * so neighbouring cards overlap without burying each other.
 */
export const TESTIMONIALS: Testimonial[] = [];

/**
 * PLACEHOLDER CONTENT — replace wholesale with approved quotes, then move the
 * entries into `TESTIMONIALS` above. Names and companies are deliberately
 * generic tokens so nothing here can be mistaken for a real endorsement.
 */
export const TESTIMONIAL_PLACEHOLDERS: Testimonial[] = [
  {
    id: 'placeholder-01',
    name: 'Client One',
    role: 'Marketing Director',
    company: 'Hospitality Group',
    quote:
      'Placeholder quote. One team carried the work from positioning through launch, and the pace never dropped once.',
    initials: 'C1',
    initialX: 0,
    initialY: 150,
    initialRotation: -5,
  },
  {
    id: 'placeholder-02',
    name: 'Client Two',
    role: 'Head of Brand',
    company: 'Banking',
    quote:
      'Placeholder quote. They read the brief we could not write ourselves, then made the answer look obvious in hindsight.',
    initials: 'C2',
    initialX: 420,
    initialY: 24,
    initialRotation: 4,
  },
  {
    id: 'placeholder-03',
    name: 'Client Three',
    role: 'Founder',
    company: 'Beauty',
    quote:
      'Placeholder quote. Strategy, design, and build sat in one room, so nothing was lost in the handover between them.',
    initials: 'C3',
    initialX: 830,
    initialY: 236,
    initialRotation: -3,
  },
  {
    id: 'placeholder-04',
    name: 'Client Four',
    role: 'Commercial Lead',
    company: 'Luxury Retail',
    quote:
      'Placeholder quote. The launch moved numbers in the first quarter, and the reporting told us exactly why.',
    initials: 'C4',
    initialX: 1250,
    initialY: 56,
    initialRotation: 6,
  },
  {
    id: 'placeholder-05',
    name: 'Client Five',
    role: 'Operations Manager',
    company: 'Consulting',
    quote:
      'Placeholder quote. Every deadline held. Every question got an answer the same day. That is rarer than it should be.',
    initials: 'C5',
    initialX: 1665,
    initialY: 214,
    initialRotation: -6,
  },
  {
    id: 'placeholder-06',
    name: 'Client Six',
    role: 'Product Director',
    company: 'Technology',
    quote:
      'Placeholder quote. We arrived with a rebrand request and left with a partner who kept challenging the easy option.',
    initials: 'C6',
    initialX: 2080,
    initialY: 92,
    initialRotation: 3,
  },
];
