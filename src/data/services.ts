import type { ServiceCategory } from '../types';
import phBusinessStrategy from '../assets/placeholders/ph-business-strategy.svg';
import phMarketingSignal from '../assets/placeholders/ph-marketing-signal.svg';
import phCreativeCraft from '../assets/placeholders/ph-creative-craft.svg';
import phTechInterface from '../assets/placeholders/ph-tech-interface.svg';

/**
 * Service architecture per the approved brief; individual services sourced
 * from solu1ions.com. Verify wording against the live site before launch.
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'business-development',
    index: '01',
    title: ['Business Development', '& Consultancy'],
    description:
      'Clarity before motion. We work inside the business — strategy, planning, and management systems that give leadership real control over where the company is going.',
    services: [
      'Business Development Consultancy',
      'Business Strategy',
      'Business Planning',
      'Corporate Statement Development',
      'Business Tracking & Control',
      'Management Consultancy',
      'Brand Management',
      'Content Development',
      'Business Documentation',
      'Microsoft Office Solutions',
    ],
    media: {
      src: phBusinessStrategy,
      alt: 'Placeholder illustration: ascending chart measures and a rising trajectory over a planning grid',
    },
    tone: 'dark',
  },
  {
    id: 'marketing',
    index: '02',
    title: ['Marketing', '& Communications'],
    description:
      'Presence with intent. Campaigns, channels, and content built on strategy first — so every message moves the business, not just the feed.',
    services: [
      'Marketing Consultancy',
      'Marketing Strategy',
      'Digital Marketing',
      'Social Media Management',
      'Content Marketing',
      'Advertising & Promotion',
      'Influencer Campaigns',
      'SEO',
      'SEM',
    ],
    media: {
      src: phMarketingSignal,
      alt: 'Placeholder illustration: a broadcast point radiating signal arcs toward audience nodes and message panels',
    },
    tone: 'light',
  },
  {
    id: 'creative',
    index: '03',
    title: ['Visual Communication', '& Creative Production'],
    description:
      'The craft the market sees. Identities, design, and production executed to a standard that holds up next to the brands our clients compete with.',
    services: [
      'Branding & Rebranding',
      'Visual Identity',
      'Graphic Design',
      'Motion Graphics',
      'Video Production & Editing',
      'Illustration & Drawing',
      'Fine Arts',
      'Web Design',
      'Print Design',
    ],
    media: {
      src: phCreativeCraft,
      alt: 'Placeholder illustration: a drawing board with a bezier curve, crop marks, and brand color swatches',
    },
    tone: 'dark',
  },
  {
    id: 'technology',
    index: '04',
    title: ['Technology', '& Digital Solutions'],
    description:
      'Engineered, not improvised. Platforms, products, and systems designed to carry the business — built once, built properly.',
    services: [
      'Website Development',
      'Application Development',
      'System Development',
      'Digital Platforms',
      'UI Design',
      'UX Design',
      'Web Hosting',
      'Domain Registration',
      'Technology Solutions',
    ],
    media: {
      src: phTechInterface,
      alt: 'Placeholder illustration: an interface window with code lines connected to a system diagram',
    },
    tone: 'light',
  },
];
