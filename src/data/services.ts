import type { ServiceCategory } from '../types';

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
      'Strategy, planning, and operating systems that give the business clear direction.',
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
  },
  {
    id: 'marketing',
    index: '02',
    title: ['Marketing', '& Communications'],
    description:
      'Campaigns, content, and channels designed to move the business forward.',
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
  },
  {
    id: 'creative',
    index: '03',
    title: ['Visual Communication', '& Creative Production'],
    description:
      'Brand identities, design, and production created to compete at a higher level.',
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
  },
  {
    id: 'technology',
    index: '04',
    title: ['Technology', '& Digital Solutions'],
    description:
      'Websites, applications, and platforms engineered for long-term growth.',
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
  },
];
