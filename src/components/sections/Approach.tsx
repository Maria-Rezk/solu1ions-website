import { useState } from 'react';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { VALUES, VISION, MISSION } from '../../data/values';

/**
 * Our approach — vision, mission, and the six beliefs from the brand book,
 * presented as an accessible accordion (buttons + aria-expanded, animated
 * with a pure-CSS grid-rows transition).
 */
export function Approach() {
  const [open, setOpen] = useState<string | null>(VALUES[0]?.index ?? null);

  return (
    <section id="approach" className="section section--navy approach" aria-labelledby="approach-heading">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow t-label">Our approach</p>
          <SplitLines as="h2" id="approach-heading" className="approach__title t-display">
            Innovation meets <em className="t-accent t-italic">stability.</em>
          </SplitLines>
        </div>

        <div className="approach__pillars">
          <Reveal className="approach__pillar">
            <h3 className="t-label t-accent">Vision</h3>
            <p className="approach__pillar-text">{VISION}</p>
          </Reveal>
          <Reveal className="approach__pillar" delay={0.1}>
            <h3 className="t-label t-accent">Mission</h3>
            <p className="approach__pillar-text">{MISSION}</p>
          </Reveal>
        </div>

        <h3 className="approach__values-label t-label">What we believe</h3>
        <ul className="approach__values">
          {VALUES.map((value) => {
            const isOpen = open === value.index;
            return (
              <li key={value.index} className={`value ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="value__toggle"
                  aria-expanded={isOpen}
                  aria-controls={`value-panel-${value.index}`}
                  onClick={() => setOpen(isOpen ? null : value.index)}
                >
                  <span className="value__index t-label" aria-hidden="true">
                    {value.index}
                  </span>
                  <span className="value__name t-display">{value.name}</span>
                  <span className="value__icon" aria-hidden="true" />
                </button>
                <div id={`value-panel-${value.index}`} className="value__panel" role="region">
                  <p className="value__belief">{value.belief}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
