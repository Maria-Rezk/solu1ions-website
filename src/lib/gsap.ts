import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Shared motion vocabulary — one place to tune the site's feel. */
export const EASE_OUT = 'power4.out';
export const EASE_INOUT = 'power3.inOut';

export { gsap, ScrollTrigger, SplitText };
