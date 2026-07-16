import type { Project } from '../types';

/**
 * SELECTED WORK — real Solu1ions engagements (client-verified roster).
 * Media is intentionally `null`: the UI renders a branded placeholder
 * treatment until real case-study assets are supplied. Review titles,
 * years, and scope with the team before launch.
 */
export const PROJECTS: Project[] = [
  {
    id: 'royal-semiramis',
    client: 'Royal Semiramis Hotel',
    project: 'Six Days in Damascus',
    category: 'Campaign & Content Production',
    year: '2026',
    services: ['Creative Direction', 'Production', 'Social Media'],
    tint: 'linear-gradient(135deg, rgba(201,20,75,0.85), rgba(43,52,79,0.9))',
    media: null,
  },
  {
    id: 'shahba-bank',
    client: 'Shahba Bank',
    project: 'The Silent Digital Transformation',
    category: 'Strategic Communications',
    year: '2026',
    services: ['Consultancy', 'Presentation Design'],
    tint: 'linear-gradient(135deg, rgba(43,52,79,0.92), rgba(15,18,27,0.95))',
    media: null,
  },
  {
    id: 'al-hikma',
    client: 'Al Hikma Consulting',
    project: 'Website & Digital Presence',
    category: 'Web Design & Development',
    year: '2026',
    services: ['UX/UI', 'Development', 'Arabic RTL'],
    tint: 'linear-gradient(135deg, rgba(112,0,0,0.85), rgba(15,18,27,0.92))',
    media: null,
  },
  {
    id: 'al-zaman',
    client: 'Al Zaman Watches',
    project: 'Luxury Influencer Program',
    category: 'Luxury Marketing',
    year: '2026',
    services: ['Strategy', 'Influencer Relations'],
    tint: 'linear-gradient(135deg, rgba(74,93,122,0.9), rgba(43,52,79,0.92))',
    media: null,
  },
  {
    id: 'taxero',
    client: 'Taxero — Switzerland',
    project: 'Tax Platform Experience',
    category: 'Digital Product Consulting',
    year: '2026',
    services: ['Product Strategy', 'UX', 'Proposal Design'],
    tint: 'linear-gradient(135deg, rgba(156,26,53,0.85), rgba(43,52,79,0.9))',
    media: null,
  },
  {
    id: 'ommayad',
    client: 'Ommayad Hotel',
    project: 'Social Media Strategy',
    category: 'Strategy & Content',
    year: '2026',
    services: ['Strategy', 'Content Direction'],
    tint: 'linear-gradient(135deg, rgba(15,18,27,0.9), rgba(201,20,75,0.75))',
    media: null,
  },
];
