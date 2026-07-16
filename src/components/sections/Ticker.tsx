import { Fragment } from 'react';
import { Marquee } from '../motion/Marquee';
import { MARQUEE_WORDS } from '../../data/site';

/**
 * Full-bleed vocabulary ticker between the hero and the introduction:
 * Strategy / Creativity / Technology / Execution / Growth on a seamless loop.
 */
export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <Marquee duration={26} className="ticker__marquee">
        {MARQUEE_WORDS.map((word) => (
          <Fragment key={word}>
            <span className="ticker__word t-display">{word}</span>
            <span className="ticker__sep" />
          </Fragment>
        ))}
      </Marquee>
    </div>
  );
}
