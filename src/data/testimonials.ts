import type { Testimonial } from '../types';

/**
 * TESTIMONIALS — architecture is in place; the section renders only when
 * this array contains verified client quotes. Never publish fabricated
 * testimonials. Example shape:
 *
 * { quote: '…', name: 'Full Name', role: 'Title, Company' }
 */
export const TESTIMONIALS: Testimonial[] = [];
