import { useState } from 'react';
import { Reveal } from '../motion/Reveal';
import { TESTIMONIALS } from '../../data/testimonials';

/**
 * Success stories. The component architecture is complete (accessible
 * prev/next controls, keyboard support, live-region announcements), but the
 * section renders NOTHING until data/testimonials.ts contains verified
 * client quotes — no fabricated praise is ever published.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const count = TESTIMONIALS.length;

  if (count === 0) return null;

  const current = TESTIMONIALS[index];
  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section className="section testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow t-label">Success stories</p>
          <h2 id="testimonials-heading" className="testimonials__title t-display">
            In their words.
          </h2>
        </div>

        <Reveal>
          <figure
            className="testimonials__card"
            aria-live="polite"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') go(-1);
              if (e.key === 'ArrowRight') go(1);
            }}
          >
            <blockquote>
              <p className="testimonials__quote">“{current.quote}”</p>
            </blockquote>
            <figcaption className="t-muted">
              {current.name} — {current.role}
            </figcaption>
          </figure>
        </Reveal>

        {count > 1 && (
          <div className="testimonials__controls">
            <button type="button" className="btn" onClick={() => go(-1)} aria-label="Previous testimonial">
              ←
            </button>
            <span className="t-label" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button type="button" className="btn" onClick={() => go(1)} aria-label="Next testimonial">
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
