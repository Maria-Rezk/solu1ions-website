import wordmarkRaw from '../../assets/brand/logo-wordmark.svg?raw';
import iconRaw from '../../assets/brand/logo-icon.svg?raw';

interface LogoProps {
  /** Full horizontal lockup (default) or the 1T icon mark alone. */
  variant?: 'wordmark' | 'icon';
  className?: string;
  /** Accessible name; pass '' and set aria-hidden upstream for decorative use. */
  title?: string;
}

/**
 * Official Solu1ions logo, inlined from the brand vector so the wordmark can
 * recolour with `currentColor` (white on dark surfaces, navy on light) while
 * the "1" arrow keeps its approved Virtual Pink accent. Two-tone-on-navy and
 * two-tone-on-light are both approved variations in the brand guidelines.
 */
export function Logo({ variant = 'wordmark', className, title = 'Solu1ions' }: LogoProps) {
  const raw = variant === 'wordmark' ? wordmarkRaw : iconRaw;
  const decorative = title === '';
  return (
    <span
      className={`logo logo--${variant}${className ? ` ${className}` : ''}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}
