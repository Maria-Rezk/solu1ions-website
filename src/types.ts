/** Shared domain types for the Solu1ions site content model. */

export interface NavItem {
  index: string;
  label: string;
  href: string;
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

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  /** How this person thinks about their work — never client feedback. */
  vision: string;
  /** Marks unapproved content so the card can flag itself. */
  pending?: boolean;
  /**
   * Desktop scatter preset in drag-layer pixels, authored against a 400px
   * reference card and scaled to the real card width at runtime.
   */
  initialX: number;
  initialY: number;
  initialRotation: number;
  cardVariant?: 'feature' | 'compact';
}

export interface ValueItem {
  index: string;
  name: string;
  belief: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  /** Optional portrait. When absent the card falls back to `initials`. */
  avatar?: { src: string; alt: string };
  initials?: string;
  /**
   * Desktop scatter preset, in drag-layer pixels. Tablet and mobile layouts
   * are derived from these values — see components/sections/Testimonials.tsx.
   */
  initialX: number;
  initialY: number;
  initialRotation: number;
}
