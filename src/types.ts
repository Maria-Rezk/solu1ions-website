/** Shared domain types for the Solu1ions site content model. */

export interface NavItem {
  index: string;
  label: string;
  href: `#${string}`;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface ServiceCategory {
  id: string;
  index: string;
  title: [string, string];
  description: string;
  services: string[];
  media: { src: string; alt: string; contain?: boolean };
  tone: 'dark' | 'light';
}

export interface Milestone {
  year: string;
  title: string;
  story: string;
  image: { src: string; alt: string };
}

export interface Project {
  id: string;
  client: string;
  project: string;
  category: string;
  year: string;
  services: string[];
  /** CSS gradient tint applied over the shared brand-pattern placeholder. */
  tint: string;
  /**
   * Replace with real case-study media before adding detail pages.
   * Keeping `media: null` renders the branded placeholder treatment.
   */
  media: { src: string; alt: string } | null;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface ValueItem {
  index: string;
  name: string;
  belief: string;
}
