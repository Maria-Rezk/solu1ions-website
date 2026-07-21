import type { Milestone } from '../types';
import phoenix from '../assets/statue-phoenix-cutout.webp';
import resilience from '../assets/statue-resilience-cutout.webp';
import goat from '../assets/statue-goat-cutout.webp';
import eagle from '../assets/statue-eagle-cutout.webp';
import storm from '../assets/statue-storm-cutout.webp';

/**
 * "The Story Behind Each Year" — verbatim from the Solu1ions Brand
 * Guidelines. Each year is marked by a silver figure of its character.
 */
export const MILESTONES: Milestone[] = [
  {
    year: '2021',
    title: 'Year of the Phoenix',
    story:
      'Rising from challenges, this year marks our rebirth and the beginning of something greater.',
    image: { src: phoenix, alt: 'Silver phoenix statue with raised wings' },
  },
  {
    year: '2022',
    title: 'Year of Resilience',
    story: 'Through pressure and uncertainty, we held our ground and emerged unbroken.',
    image: { src: resilience, alt: 'Silver statue of a figure standing against swirling waves' },
  },
  {
    year: '2023',
    title: 'Year of the Mountain Goat',
    story: 'We navigated steep terrain with steady footing, climbing where others stopped.',
    image: { src: goat, alt: 'Silver mountain goat statue standing on a rock peak' },
  },
  {
    year: '2024',
    title: 'Year of the Baby Eagle',
    story: 'We spread our wings for the first time and discovered just how far we could fly.',
    image: { src: eagle, alt: 'Silver baby eagle statue with open wings' },
  },
  {
    year: '2025',
    title: 'Year of the Storm Rider',
    story:
      'Where others saw disruption, we found momentum and rode the storm with fearless energy.',
    image: { src: storm, alt: 'Silver eagle statue riding a swirling storm' },
  },
];
