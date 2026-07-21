import { Fragment } from 'react';
import { Marquee } from '../motion/Marquee';
import { Reveal } from '../motion/Reveal';
import { CLIENTS } from '../../data/clients';

const HALF = Math.ceil(CLIENTS.length / 2);
const ROW_A = CLIENTS.slice(0, HALF);
const ROW_B = CLIENTS.slice(HALF);

function Row({ names }: { names: string[] }) {
  return (
    <>
      {names.map((name) => (
        <Fragment key={name}>
          <span className="clients__name t-display">{name}</span>
          <span className="clients__sep" aria-hidden="true" />
        </Fragment>
      ))}
    </>
  );
}

/**
 * Typographic client roster — two counter-scrolling rows. Rendered as text
 * (no invented logo artwork); the full list lives in data/clients.ts with a
 * pre-launch verification note.
 */
export function Clients() {
  return (
    <section className="clients" aria-label="Selected clients">
      <Reveal className="container clients__head" y={24}>
        <p className="eyebrow t-label">Selected clients</p>
        <p className="t-muted">
          Across hospitality, banking, luxury, beauty, consulting, and technology.
        </p>
      </Reveal>
      <Marquee duration={38} ariaLabel={`Clients: ${ROW_A.join(', ')}`} className="clients__row">
        <Row names={ROW_A} />
      </Marquee>
      <Marquee
        duration={44}
        reverse
        ariaLabel={`Clients: ${ROW_B.join(', ')}`}
        className="clients__row clients__row--outline"
      >
        <Row names={ROW_B} />
      </Marquee>
    </section>
  );
}
