import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { scrollToId } from '../../lib/scroll';
import { SITE } from '../../data/site';
import { VISION } from '../../data/values';

/**
 * Company introduction. Copy is drawn from the "About Solu1ions" page of the
 * brand guidelines and the live site, tightened for the web — meaning
 * preserved, grammar and rhythm improved.
 */
export function Intro() {
  return (
    <section id="about" className="section intro" aria-labelledby="intro-heading">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow t-label">About Solu1ions</p>
        </div>

        <SplitLines as="h2" id="intro-heading" className="intro__statement t-display">
          Businesses shouldn't need five suppliers to move forward. We connect strategy,
          creativity, technology, and execution — one partner, accountable for the whole picture.
        </SplitLines>

        <div className="intro__grid">
          <Reveal className="intro__col">
            <p>
              Solu1ions is a forward-thinking company dedicated to meeting client needs with
              customised advice, services, and solutions. As a one-stop destination, it offers
              everything a business needs to surpass its competitors and reach its goals — from
              business development and marketing to graphic design, management, quality, HR
              development, capacity building, and IT services.
            </p>
            <p>
              We work with individuals and startups, companies, NGOs, and corporates — designing
              each engagement around the problem in front of us, not a fixed menu.
            </p>
            <p className="intro__vision">
              <span className="t-label t-accent">Our vision</span>
              {VISION}
            </p>
          </Reveal>

          <Reveal className="intro__col" delay={0.12}>
            <figure className="intro__quote">
              <blockquote className="t-display">
                <p>“If it's legal, we can do it.”</p>
              </blockquote>
              <figcaption className="t-muted">— {SITE.founder}</figcaption>
            </figure>

            <a
              href="#services"
              className="arrow-link intro__link"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#services');
              }}
            >
              Explore the services <span className="arrow" aria-hidden="true">↘</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
