import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { scrollToId } from '../../lib/scroll';
import { SERVICE_CATEGORIES } from '../../data/services';
import { gsap, ScrollTrigger, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const serviceTotal = SERVICE_CATEGORIES.reduce((total, category) => total + category.services.length, 0);
const serviceModes = ['Diagnose', 'Shape', 'Launch'];
const SERVICE_FOCUS_INTERVAL = 4.6;

function getIntersectionArea(a: DOMRect | { left: number; right: number; top: number; bottom: number }, b: DOMRect) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  return width * height;
}

export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    let cleanupServicesMotion: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.service-card');
      const gearWrap = root.querySelector<HTMLElement>('.services__gear-wrap');

      if (!gearWrap) return;

      const glow = gearWrap.querySelector<HTMLElement>('.services__gear-glow');
      const gearPosition = { x: 0, y: 0 };
      let activeIndex = -1;
      let gearTween: ReturnType<typeof gsap.to> | undefined;
      let gearPulse: ReturnType<typeof gsap.timeline> | undefined;
      let sectionIsLive = false;
      const removeInteractionListeners: Array<() => void> = [];

      const getImportantElements = () => {
        const sticky = root.querySelector<HTMLElement>('.services__sticky');
        return [sticky, ...cards].filter((el): el is HTMLElement => Boolean(el));
      };

      /* Section-relative rects of readable content — measured once per gear
         move so the per-frame overlap check never touches layout. */
      const measureImportantRects = () => {
        const sectionRect = root.getBoundingClientRect();
        return getImportantElements().map((el) => {
          const rect = el.getBoundingClientRect();
          return new DOMRect(rect.left - sectionRect.left, rect.top - sectionRect.top, rect.width, rect.height);
        });
      };

      const applyGearOverlap = (importantRects: DOMRect[]) => {
        const size = gearWrap.offsetWidth;
        const inset = size * (root.clientWidth <= 760 ? 0.32 : 0.28);
        const readableCore = {
          left: gearPosition.x + inset,
          right: gearPosition.x + size - inset,
          top: gearPosition.y + inset,
          bottom: gearPosition.y + size - inset,
        };
        const hasOverlap = importantRects.some((rect) => getIntersectionArea(readableCore, rect) > 0);

        gearWrap.classList.toggle('is-softened', hasOverlap);
      };

      const getGearTarget = (card: HTMLElement, index: number) => {
        const sectionRect = root.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const gearSize = gearWrap.offsetWidth;
        const isMobile = sectionRect.width <= 760;
        const isTablet = sectionRect.width <= 1080;
        const direction = index % 2 === 0 ? 1 : -1;
        const cardCenter = {
          x: cardRect.left - sectionRect.left + cardRect.width / 2,
          y: cardRect.top - sectionRect.top + cardRect.height / 2,
        };
        const horizontalReach = isMobile ? gearSize * 0.28 : gearSize * 0.44;
        const verticalReach = isMobile ? cardRect.height * 0.5 : Math.min(cardRect.height * 0.7, gearSize * 0.35);
        const candidates = [
          { x: cardCenter.x + direction * (cardRect.width * 0.55 + horizontalReach), y: cardCenter.y - verticalReach * 0.25 },
          { x: cardCenter.x - direction * (cardRect.width * 0.5 + horizontalReach * 0.7), y: cardCenter.y + verticalReach * 0.35 },
          { x: cardCenter.x + direction * cardRect.width * 0.18, y: cardCenter.y - cardRect.height * 0.78 },
          { x: cardCenter.x - direction * cardRect.width * 0.18, y: cardCenter.y + cardRect.height * 0.78 },
          {
            x: direction > 0 ? sectionRect.width - gearSize * (isTablet ? 0.18 : 0.08) : gearSize * (isTablet ? 0.18 : 0.08),
            y: cardCenter.y,
          },
        ];

        if (isMobile) {
          candidates.unshift(
            { x: sectionRect.width - gearSize * 0.08, y: cardCenter.y - cardRect.height * 0.62 },
            { x: gearSize * 0.08, y: cardCenter.y + cardRect.height * 0.62 },
          );
        }

        const minX = isMobile ? -gearSize * 0.32 : -gearSize * 0.18;
        const maxX = Math.max(minX, sectionRect.width - gearSize * (isMobile ? 0.68 : 0.82));
        const minY = -gearSize * (isMobile ? 0.12 : 0.18);
        const maxY = Math.max(minY, sectionRect.height - gearSize * (isMobile ? 0.8 : 0.9));
        const toTopLeft = (point: { x: number; y: number }) => ({
          x: gsap.utils.clamp(minX, maxX, point.x - gearSize / 2),
          y: gsap.utils.clamp(minY, maxY, point.y - gearSize / 2),
        });
        const importantRects = measureImportantRects();
        const scoreTarget = (target: { x: number; y: number }) => {
          const gearCore = new DOMRect(
            target.x + gearSize * 0.26,
            target.y + gearSize * 0.26,
            gearSize * 0.48,
            gearSize * 0.48,
          );
          const overlapPenalty = importantRects.reduce((score, rect) => score + getIntersectionArea(gearCore, rect) * 0.08, 0);
          const centerDistance = Math.hypot(target.x + gearSize / 2 - cardCenter.x, target.y + gearSize / 2 - cardCenter.y);

          return centerDistance + overlapPenalty;
        };

        return candidates.map(toTopLeft).sort((a, b) => scoreTarget(a) - scoreTarget(b))[0];
      };

      const moveGearToCard = (card: HTMLElement, index: number, immediate = false) => {
        const target = getGearTarget(card, index);
        const overlapRects = measureImportantRects();

        if (immediate) {
          gearPosition.x = target.x;
          gearPosition.y = target.y;
          gsap.set(gearWrap, { x: target.x, y: target.y });
          applyGearOverlap(overlapRects);
          return;
        }

        const start = { ...gearPosition };
        const isMobile = root.clientWidth <= 760;
        const bend = Math.min(root.clientWidth * (isMobile ? 0.08 : 0.12), isMobile ? 42 : 170);
        const control = {
          x: (start.x + target.x) / 2 + (index % 2 === 0 ? bend : -bend),
          y: Math.min(start.y, target.y) - (isMobile ? 24 : 82),
        };
        const curve = { t: 0 };

        gearTween?.kill();
        gearTween = gsap.to(curve, {
          t: 1,
          duration: isMobile ? 1.05 : 1.35,
          ease: EASE_OUT,
          onStart: () => gearWrap.classList.add('is-moving'),
          onUpdate: () => {
            const t = curve.t;
            const u = 1 - t;
            gearPosition.x = u * u * start.x + 2 * u * t * control.x + t * t * target.x;
            gearPosition.y = u * u * start.y + 2 * u * t * control.y + t * t * target.y;
            gsap.set(gearWrap, { x: gearPosition.x, y: gearPosition.y });
            applyGearOverlap(overlapRects);
          },
          onComplete: () => {
            gearPosition.x = target.x;
            gearPosition.y = target.y;
            gearWrap.classList.remove('is-moving');
            applyGearOverlap(overlapRects);
          },
        });

        gearPulse?.kill();
        gearPulse = gsap
          .timeline({ defaults: { ease: EASE_OUT, overwrite: 'auto' } })
          .to(gearWrap, { scale: 1.018, duration: 0.7 })
          .to(gearWrap, { scale: index % 2 === 0 ? 0.992 : 1.006, duration: 0.68 });

        if (glow) {
          gsap.fromTo(
            glow,
            { scale: 0.94 },
            { scale: 1.04, duration: 0.72, ease: EASE_OUT, yoyo: true, repeat: 1, overwrite: 'auto' },
          );
        }
      };

      const highlightCard = (index: number) => {
        cards.forEach((item, itemIndex) => item.classList.toggle('is-service-active', itemIndex === index));
      };

      const activateCard = (index: number, immediate = false) => {
        const card = cards[index];

        if (!card || (index === activeIndex && !immediate)) return;

        highlightCard(index);
        activeIndex = index;
        moveGearToCard(card, index, immediate);
      };

      cards.forEach((card, index) => {
        const fromLeft = index % 2 === 0;
        const visual = card.querySelector<HTMLElement>('.service-card__visual');
        const services = gsap.utils.toArray<HTMLElement>(card.querySelectorAll('.service-card__service'));

        gsap.from(card, {
          autoAlpha: 0,
          x: fromLeft ? -38 : 38,
          y: 24,
          rotate: fromLeft ? -0.7 : 0.7,
          duration: 0.9,
          ease: EASE_OUT,
          scrollTrigger: { trigger: card, start: 'top 84%', once: true },
        });

        if (visual) {
          gsap.to(visual, {
            yPercent: fromLeft ? -4 : 4,
            rotate: fromLeft ? 0.9 : -0.9,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }

        gsap.from(services, {
          autoAlpha: 0,
          y: 10,
          duration: 0.45,
          ease: EASE_OUT,
          stagger: 0.035,
          scrollTrigger: { trigger: card, start: 'top 72%', once: true },
        });

        ScrollTrigger.create({
          trigger: card,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: () => activateCard(index),
          onEnterBack: () => activateCard(index),
        });
      });

      activateCard(0, true);

      const focusCycle = gsap.timeline({ repeat: -1, paused: true });

      cards.forEach((_card, index) => {
        focusCycle.call(() => activateCard(index));
        focusCycle.to({}, { duration: SERVICE_FOCUS_INTERVAL });
      });

      ScrollTrigger.create({
        trigger: root,
        start: 'top 82%',
        end: 'bottom 18%',
        onEnter: () => {
          sectionIsLive = true;
          focusCycle.play();
        },
        onEnterBack: () => {
          sectionIsLive = true;
          focusCycle.play();
        },
        onLeave: () => {
          sectionIsLive = false;
          focusCycle.pause();
        },
        onLeaveBack: () => {
          sectionIsLive = false;
          focusCycle.pause();
        },
      });

      cards.forEach((card, index) => {
        /* Hover highlights the card and pauses the focus cycle, but never
           yanks the gear toward the hovered card — it keeps its slow drift. */
        const pauseForInteraction = () => {
          focusCycle.pause();
          highlightCard(index);
        };
        const resumeAfterInteraction = () => {
          highlightCard(activeIndex);
          if (sectionIsLive) focusCycle.resume();
        };
        const onFocusOut = (event: FocusEvent) => {
          if (!card.contains(event.relatedTarget as Node | null)) resumeAfterInteraction();
        };

        card.addEventListener('pointerenter', pauseForInteraction);
        card.addEventListener('pointerleave', resumeAfterInteraction);
        card.addEventListener('focusin', pauseForInteraction);
        card.addEventListener('focusout', onFocusOut);
        removeInteractionListeners.push(() => {
          card.removeEventListener('pointerenter', pauseForInteraction);
          card.removeEventListener('pointerleave', resumeAfterInteraction);
          card.removeEventListener('focusin', pauseForInteraction);
          card.removeEventListener('focusout', onFocusOut);
        });
      });

      const syncGearOnResize = () => {
        if (activeIndex < 0) return;

        moveGearToCard(cards[activeIndex], activeIndex, true);
      };

      window.addEventListener('resize', syncGearOnResize);

      cleanupServicesMotion = () => {
        window.removeEventListener('resize', syncGearOnResize);
        removeInteractionListeners.forEach((remove) => remove());
        cards.forEach((card) => {
          card.classList.remove('is-service-active');
        });
        focusCycle.kill();
        gearTween?.kill();
        gearPulse?.kill();
      };
    }, root);

    return () => {
      cleanupServicesMotion?.();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={rootRef} id="services" className="services section--navy" aria-labelledby="services-heading">
      <div className="services__ambient" aria-hidden="true">
        <div className="services__gear-wrap">
          <span className="services__gear-glow" />
          <span className="services__gear" />
        </div>
      </div>

      <div className="container services__container">
        <div className="services__shell">
          <div className="services__sticky">
            <p className="eyebrow t-label">What we do</p>
            <SplitLines as="h2" id="services-heading" className="services__title t-display">
              Not a menu of services. <em className="t-accent t-italic">A system for momentum.</em>
            </SplitLines>
            <Reveal>
              <p className="services__lede">
                We connect strategy, communication, craft, and technology so each decision feeds the next one.
              </p>
            </Reveal>

            <div className="services__metrics" aria-label="Solu1ions service structure">
              <span className="services__metric">
                <strong>{String(SERVICE_CATEGORIES.length).padStart(2, '0')}</strong>
                <span>Disciplines</span>
              </span>
              <span className="services__metric">
                <strong>{serviceTotal}</strong>
                <span>Services</span>
              </span>
              <span className="services__metric">
                <strong>01</strong>
                <span>Partner</span>
              </span>
            </div>

            <div className="services__modes" aria-label="How we move work forward">
              {serviceModes.map((mode) => (
                <span key={mode}>{mode}</span>
              ))}
            </div>

            <a
              href="#contact"
              className="btn services__cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#contact');
              }}
            >
              Build your stack <span aria-hidden="true">-&gt;</span>
            </a>
          </div>

          <div className="services__stack">
            <div className="services__axis" aria-hidden="true">
              {SERVICE_CATEGORIES.map((category) => (
                <span key={category.id}>{category.index}</span>
              ))}
            </div>

            {SERVICE_CATEGORIES.map((category, index) => {
              const visibleServices = category.services.slice(0, 5);
              const hiddenCount = category.services.length - visibleServices.length;
              const carouselServices = [
                ...visibleServices.map((service) => ({ label: service, isMore: false })),
                ...(hiddenCount > 0 ? [{ label: `+${hiddenCount}`, isMore: true }] : []),
              ];

              return (
                <article
                  key={category.id}
                  id={category.id}
                  className={`service-card service-card--${index + 1} service-card--${index % 2 === 0 ? 'left' : 'right'}`}
                  aria-labelledby={`${category.id}-title`}
                >
                  <div className="service-card__top">
                    <span className="service-card__index t-display" aria-hidden="true">
                      {category.index}
                    </span>
                    <span className="service-card__signal t-label">
                      {index % 2 === 0 ? 'Inside the business' : 'Facing the market'}
                    </span>
                  </div>

                  <div className="service-card__body">
                    <div className="service-card__copy">
                      <SplitLines as="h3" id={`${category.id}-title`} className="service-card__title t-display">
                        {category.title[0]} <em className="t-accent t-italic">{category.title[1]}</em>
                      </SplitLines>
                      <Reveal y={28}>
                        <p className="service-card__desc">{category.description}</p>
                      </Reveal>
                    </div>

                    <Reveal
                      variant="zoom"
                      className={`service-card__visual${category.media.treatment === 'cursor-mark' ? ' service-card__visual--mark' : ''}`}
                    >
                      {category.media.treatment === 'cursor-mark' ? (
                        <span className="service-card__cursor-mark" role="img" aria-label={category.media.alt} />
                      ) : (
                        <img
                          src={category.media.src}
                          alt={category.media.alt}
                          loading="lazy"
                          decoding="async"
                          className={category.media.contain ? 'service-card__img service-card__img--contain' : 'service-card__img'}
                        />
                      )}
                    </Reveal>
                  </div>

                  <div className="service-card__services-viewport">
                    <div
                      className={`service-card__services-track service-card__services-track--${index % 2 === 0 ? 'ltr' : 'rtl'}`}
                      style={{ '--service-carousel-duration': `${32 + carouselServices.length * 1.7}s` } as CSSProperties}
                    >
                      <ul className="service-card__services" aria-label={`${category.title[0]} services`}>
                        {carouselServices.map((service) => (
                          <li
                            key={service.label}
                            className={`service-card__service${service.isMore ? ' service-card__service--more' : ''}`}
                          >
                            {service.label}
                          </li>
                        ))}
                      </ul>
                      <ul className="service-card__services" aria-hidden="true">
                        {carouselServices.map((service) => (
                          <li
                            key={`clone-${service.label}`}
                            className={`service-card__service${service.isMore ? ' service-card__service--more' : ''}`}
                          >
                            {service.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="arrow-link service-card__link"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId('#contact');
                    }}
                  >
                    Discuss this line <span className="arrow" aria-hidden="true">-&gt;</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
