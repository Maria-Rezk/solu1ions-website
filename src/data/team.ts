import type { TeamMember } from '../types';

/**
 * TEAM — approved profiles only. Everything below is marked `pending: true`
 * until a real name is signed off, so the cards flag themselves instead of
 * publishing invented employee information.
 *
 * To publish a member: set the real `name` and drop `pending`.
 *
 * `initialX / initialY / initialRotation` describe the desktop scatter against
 * a 400px reference card; components/sections/Team.tsx scales them to the real
 * card width and derives the tablet and mobile compositions from there.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'ceo',
    name: 'Name pending',
    position: 'CEO',
    vision: 'Great work begins when strategy, people, and execution move in the same direction.',
    pending: true,
    initialX: 0,
    initialY: 130,
    initialRotation: -5,
    cardVariant: 'feature',
  },
  {
    id: 'software-developer',
    name: 'Name pending',
    position: 'Software Developer',
    vision:
      'Every interaction should feel simple, even when the technology behind it is complex.',
    pending: true,
    initialX: 452,
    initialY: 8,
    initialRotation: 4,
    cardVariant: 'compact',
  },
  {
    id: 'art-director',
    name: 'Name pending',
    position: 'Art Director',
    vision: 'Design should create an emotion before it delivers an explanation.',
    pending: true,
    initialX: 904,
    initialY: 180,
    initialRotation: -3,
    cardVariant: 'feature',
  },
  {
    id: 'operations-manager',
    name: 'Name pending',
    position: 'Operations Manager',
    vision:
      'Creative ideas become valuable when they are transformed into consistent execution.',
    pending: true,
    initialX: 1356,
    initialY: 40,
    initialRotation: 6,
    cardVariant: 'compact',
  },
  {
    id: 'graphic-designer',
    name: 'Name pending',
    position: 'Graphic Designer',
    vision: 'Every visual decision should strengthen the story, not distract from it.',
    pending: true,
    initialX: 1808,
    initialY: 156,
    initialRotation: -4,
    cardVariant: 'feature',
  },
  {
    id: 'ux-designer',
    name: 'Name pending',
    position: 'UI/UX Designer',
    vision: 'Good experiences remove friction and make every decision feel natural.',
    pending: true,
    initialX: 2260,
    initialY: 20,
    initialRotation: 3,
    cardVariant: 'compact',
  },
  {
    id: 'motion-designer',
    name: 'Name pending',
    position: 'Motion Designer',
    vision:
      'Movement should guide attention, create rhythm, and give the interface a personality.',
    pending: true,
    initialX: 2712,
    initialY: 192,
    initialRotation: -6,
    cardVariant: 'feature',
  },
];
