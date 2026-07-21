import { useLayoutEffect, useRef } from 'react';
import { scrollToId } from '../../lib/scroll';
import { gsap, EASE_INOUT, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { MISSION, VALUES, VISION } from '../../data/values';
import markChrome from '../../assets/mark-chrome.webp';
import logoSketches from '../../assets/logo-sketches.webp';
import patternChrome from '../../assets/pattern-chrome.webp';

const systemNodes = [
  ['01', 'Strategy'],
  ['02', 'Creative'],
  ['03', 'Digital'],
  ['04', 'Launch'],
] as const;

const highlights = [
  ['01', 'Pressure mapped', 'When the business has too many moving parts and no clear next move.', 'pressure'],
  ['02', 'Systems aligned', 'Strategy, content, design, and technology moving as one operating rhythm.', 'alignment'],
  ['03', 'Launch rhythm', 'Structure, ownership, and momentum that carry the idea into market.', 'rhythm'],
  ['04', 'Growth loop', 'A clearer way to keep learning, improving, and scaling what works.', 'loop'],
] as const;

const impactWords = [
  ['strategize', patternChrome],
  ['design', logoSketches],
  ['launch', markChrome],
] as const;

type SignalKind = 'pressure' | 'alignment' | 'rhythm' | 'loop';
type Timeline = ReturnType<typeof gsap.timeline>;

function StructuralBackdrop() {
  return (
    <div className="intro__system-backdrop" aria-hidden="true">
      <span className="intro__system-grid-bg" />
      <svg className="intro__system-diagonal" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path className="intro__system-diagonal-path" pathLength="1" d="M1 39 L99 1" />
      </svg>
    </div>
  );
}

function SystemHeader({ id, eyebrow, count }: { id: string; eyebrow: string; count: string }) {
  return (
    <header className="intro__system-head">
      <span className="intro__system-eyebrow-mask">
        <h2 id={id} className="intro__system-eyebrow t-label t-accent">
          {eyebrow}
        </h2>
      </span>
      <span className="intro__system-count t-label" aria-hidden="true">
        {count}
      </span>
    </header>
  );
}

function SystemRail({ count, scanner = false }: { count: number; scanner?: boolean }) {
  return (
    <div className="intro__system-rail" aria-hidden="true">
      <span className="intro__system-track" />
      <span className="intro__system-signal" />
      {scanner && <span className="intro__system-scanner" />}
      <span className="intro__system-nodes">
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="intro__system-node" />
        ))}
      </span>
    </div>
  );
}

function CardFrame() {
  return (
    <svg className="intro__card-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="intro__frame-path intro__frame-path--top" pathLength="1" d="M0.5 1 H98.5 L99.5 2" />
      <path className="intro__frame-path intro__frame-path--side" pathLength="1" d="M99.5 2 V99 M0.5 1 V98" />
      <path className="intro__frame-path intro__frame-path--bottom" pathLength="1" d="M0.5 98 L2 99 H99.5" />
    </svg>
  );
}

function MaskedTitle({ label, className = '' }: { label: string; className?: string }) {
  return (
    <h3 className={`intro__system-title t-display ${className}`.trim()} aria-label={label}>
      {label.split(' ').map((line) => (
        <span key={line} className="intro__title-mask" aria-hidden="true">
          <span className="intro__title-line">{line}</span>
        </span>
      ))}
    </h3>
  );
}

function SignalMicro({ kind }: { kind: SignalKind }) {
  if (kind === 'pressure') {
    return (
      <span className="intro__signal-micro intro__signal-micro--pressure" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (kind === 'alignment') {
    return (
      <span className="intro__signal-micro intro__signal-micro--alignment" aria-hidden="true">
        <span />
        <span />
      </span>
    );
  }

  if (kind === 'rhythm') {
    return (
      <span className="intro__signal-micro intro__signal-micro--rhythm" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    );
  }

  return (
    <svg className="intro__signal-micro intro__signal-micro--loop" viewBox="0 0 48 48" aria-hidden="true">
      <path
        className="intro__loop-path"
        pathLength="1"
        d="M36.5 16.5A15 15 0 1 0 38 29.8M36.5 16.5v-8m0 8h-8"
      />
    </svg>
  );
}

export function Intro() {
  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    let cleanup = () => {};
    let motionMedia: ReturnType<typeof gsap.matchMedia> | null = null;

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>('.intro__watch-hero');
      const visual = visualRef.current;
      const picture = visual?.querySelector<HTMLElement>('.intro__watch-picture');
      const aura = visual?.querySelector<HTMLElement>('.intro__watch-aura');
      const plateOne = visual?.querySelector<HTMLElement>('.intro__watch-plate--one');
      const plateTwo = visual?.querySelector<HTMLElement>('.intro__watch-plate--two');
      const blur = visual?.querySelector<HTMLElement>('.intro__watch-blur-after');
      const highlightsSection = root.querySelector<HTMLElement>('.intro__highlights');
      const pillarsSection = root.querySelector<HTMLElement>('.intro__mvv');

      const elements = (parent: ParentNode, selector: string): Element[] =>
        Array.from(parent.querySelectorAll(selector));

      const prepareSystem = (section: HTMLElement, cardSelector: string, mobile: boolean) => {
        const cards = elements(section, cardSelector) as HTMLElement[];
        const railSignal = section.querySelector<HTMLElement>('.intro__system-signal');
        const scanner = section.querySelector<HTMLElement>('.intro__system-scanner');

        gsap.set(elements(section, '.intro__system-eyebrow, .intro__system-count'), {
          autoAlpha: 0,
          y: 8,
        });
        gsap.set(section.querySelector('.intro__system-eyebrow'), { letterSpacing: '0.28em' });
        gsap.set(section.querySelector('.intro__system-grid-bg'), { opacity: 0.015 });
        gsap.set(section.querySelector('.intro__system-diagonal-path'), {
          strokeDasharray: 1,
          strokeDashoffset: 1,
        });
        gsap.set(section.querySelector('.intro__system-track'), { autoAlpha: 0.25 });
        gsap.set(elements(section, '.intro__system-node'), { autoAlpha: 0.28, scale: 0.65 });

        if (railSignal) {
          gsap.set(railSignal, mobile ? { scaleX: 1, scaleY: 0 } : { scaleX: 0, scaleY: 1 });
        }

        if (scanner) {
          gsap.set(scanner, mobile ? { autoAlpha: 0 } : { autoAlpha: 1, scaleY: 0 });
        }

        cards.forEach((card) => {
          const isSignal = Boolean(card.dataset.signalKind);
          const isPressure = card.dataset.signalKind === 'pressure';
          const isMission = card.dataset.pillarKind === 'mission';
          const cardSignal = card.querySelector('.intro__card-signal');
          const cardIndex = card.querySelector('.intro__system-index');
          const description = card.querySelector('.intro__system-description');

          gsap.set(card, {
            autoAlpha: isSignal ? 0.54 : 0.46,
            x: isMission && !mobile ? -16 : 0,
            y: mobile ? 20 : isSignal ? 18 : 28,
            scaleX: isPressure && !mobile ? 0.94 : isSignal ? 0.98 : 1,
            scaleY: isSignal ? 1 : 0.95,
            transformOrigin: 'top center',
          });
          gsap.set(elements(card, '.intro__frame-path'), {
            strokeDasharray: 1,
            strokeDashoffset: 1,
          });
          if (cardSignal) gsap.set(cardSignal, { scaleX: 0 });
          if (cardIndex) gsap.set(cardIndex, { autoAlpha: 0, y: 8 });
          if (description) gsap.set(description, { autoAlpha: 0, y: 12 });

          if (isMission) {
            gsap.set(card.querySelector('.intro__system-title'), { clipPath: 'inset(0 100% 0 0)' });
            gsap.set(elements(card, '.intro__title-line'), { x: -16 });
          } else {
            gsap.set(elements(card, '.intro__title-line'), { yPercent: 110 });
          }

          const valueChips = elements(card, '.intro__value-chip');
          const valueNames = elements(card, '.intro__value-name');
          const pressureLines = elements(card, '.intro__signal-micro--pressure span');
          if (valueChips.length) gsap.set(valueChips, { autoAlpha: 0, y: 12, scale: 0.94 });
          if (valueNames.length) gsap.set(valueNames, { autoAlpha: 0, x: -2 });
          if (pressureLines.length) {
            gsap.set(pressureLines, {
              autoAlpha: 0,
              scaleY: 0,
              transformOrigin: 'center',
            });
          }

          const alignmentLines = elements(card, '.intro__signal-micro--alignment span');
          if (alignmentLines.length) {
            gsap.set(alignmentLines, { autoAlpha: 0.2 });
            if (alignmentLines[0]) gsap.set(alignmentLines[0], { x: -12 });
            if (alignmentLines[1]) gsap.set(alignmentLines[1], { x: 12 });
          }

          const rhythmLines = elements(card, '.intro__signal-micro--rhythm span');
          if (rhythmLines.length) {
            gsap.set(rhythmLines, {
              autoAlpha: 0.25,
              scaleX: 0.35,
              transformOrigin: 'left center',
            });
          }

          const loopPath = card.querySelector('.intro__loop-path');
          if (loopPath) {
            gsap.set(loopPath, {
              strokeDasharray: 1,
              strokeDashoffset: 1,
            });
          }
        });

        return cards;
      };

      const addSystemIntro = (timeline: Timeline, section: HTMLElement) => {
        timeline
          .to(section.querySelector('.intro__system-grid-bg'), { opacity: 0.07, duration: 0.48, ease: EASE_OUT }, 0)
          .to(
            section.querySelector('.intro__system-diagonal-path'),
            { strokeDashoffset: 0, duration: 0.55, ease: EASE_INOUT },
            0,
          )
          .to(
            section.querySelector('.intro__system-eyebrow'),
            { autoAlpha: 1, y: 0, letterSpacing: '0.18em', duration: 0.42, ease: EASE_OUT },
            0.05,
          )
          .to(
            section.querySelector('.intro__system-count'),
            { autoAlpha: 1, y: 0, duration: 0.36, ease: EASE_OUT },
            0.12,
          )
          .to(section.querySelector('.intro__system-track'), { autoAlpha: 0.72, duration: 0.4 }, 0.16);
      };

      const addFrameAssembly = (timeline: Timeline, card: HTMLElement, at: number) => {
        timeline
          .to(
            card,
            { autoAlpha: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.62, ease: EASE_OUT },
            at,
          )
          .to(
            card.querySelector('.intro__frame-path--top'),
            { strokeDashoffset: 0, duration: 0.24, ease: EASE_INOUT },
            at + 0.02,
          )
          .to(
            card.querySelector('.intro__frame-path--side'),
            { strokeDashoffset: 0, duration: 0.28, ease: EASE_INOUT },
            at + 0.12,
          )
          .to(
            card.querySelector('.intro__frame-path--bottom'),
            { strokeDashoffset: 0, duration: 0.25, ease: EASE_INOUT },
            at + 0.24,
          )
          .to(
            card.querySelector('.intro__card-signal'),
            { scaleX: 1, duration: 0.46, ease: EASE_INOUT },
            at + 0.04,
          )
          .to(
            card.querySelector('.intro__system-index'),
            { autoAlpha: 1, y: 0, duration: 0.34, ease: EASE_OUT },
            at + 0.16,
          );
      };

      const addSignalCard = (timeline: Timeline, card: HTMLElement, at: number) => {
        addFrameAssembly(timeline, card, at);

        const kind = card.dataset.signalKind as SignalKind;
        if (kind === 'pressure') {
          timeline
            .to(
              elements(card, '.intro__signal-micro--pressure span'),
              { autoAlpha: 0.8, scaleY: 1, duration: 0.28, stagger: 0.05, ease: EASE_OUT },
              at + 0.14,
            )
            .to(
              elements(card, '.intro__signal-micro--pressure span'),
              { autoAlpha: 0.22, duration: 0.3 },
              at + 0.55,
            );
        } else if (kind === 'alignment') {
          timeline.to(
            elements(card, '.intro__signal-micro--alignment span'),
            { autoAlpha: 0.72, x: 0, duration: 0.34, ease: EASE_INOUT },
            at + 0.13,
          );
        } else if (kind === 'rhythm') {
          timeline.to(
            elements(card, '.intro__signal-micro--rhythm span'),
            { autoAlpha: 0.7, scaleX: 1, duration: 0.28, stagger: 0.09, ease: 'power3.inOut' },
            at + 0.12,
          );
        } else {
          timeline.to(
            card.querySelector('.intro__loop-path'),
            { strokeDashoffset: 0, duration: 0.62, ease: EASE_INOUT },
            at + 0.12,
          );
        }

        timeline
          .to(
            elements(card, '.intro__title-line'),
            { yPercent: 0, duration: 0.58, stagger: 0.1, ease: EASE_OUT },
            at + 0.24,
          )
          .to(
            card.querySelector('.intro__system-description'),
            { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE_OUT },
            at + 0.4,
          );
      };

      const addPillarCard = (timeline: Timeline, card: HTMLElement, at: number) => {
        addFrameAssembly(timeline, card, at);

        if (card.dataset.pillarKind === 'mission') {
          timeline
            .to(
              card.querySelector('.intro__system-title'),
              { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_INOUT },
              at + 0.26,
            )
            .to(
              elements(card, '.intro__title-line'),
              { x: 0, duration: 0.55, ease: EASE_OUT },
              at + 0.26,
            );
        } else {
          timeline.to(
            elements(card, '.intro__title-line'),
            { yPercent: 0, duration: 0.62, ease: EASE_OUT },
            at + 0.26,
          );
        }

        const description = card.querySelector('.intro__system-description');
        if (description) {
          timeline.to(description, { autoAlpha: 1, y: 0, duration: 0.42, ease: EASE_OUT }, at + 0.42);
        }

        const chips = elements(card, '.intro__value-chip');
        if (chips.length) {
          timeline
            .to(
              chips,
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, stagger: 0.06, ease: EASE_OUT },
              at + 0.43,
            )
            .to(
              elements(card, '.intro__value-name'),
              { autoAlpha: 1, x: 0, duration: 0.26, stagger: 0.06, ease: EASE_OUT },
              at + 0.49,
            );
        }
      };

      const createDesktopSequence = (
        section: HTMLElement,
        cardSelector: string,
        kind: 'signals' | 'pillars',
      ) => {
        const cards = prepareSystem(section, cardSelector, false);
        const rail = section.querySelector<HTMLElement>('.intro__system-rail');
        const railSignal = section.querySelector<HTMLElement>('.intro__system-signal');
        const scanner = section.querySelector<HTMLElement>('.intro__system-scanner');
        const nodes = elements(section, '.intro__system-node');
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 64%', once: true },
        });

        addSystemIntro(timeline, section);
        timeline.to(
          railSignal,
          { scaleX: 1, duration: kind === 'signals' ? 1.4 : 1.08, ease: EASE_INOUT },
          0.34,
        );

        if (scanner && rail) {
          timeline
            .to(scanner, { scaleY: 1, duration: 0.2, ease: EASE_OUT }, 0.3)
            .to(
              scanner,
              { x: () => Math.max(0, rail.clientWidth - 2), duration: 1.4, ease: EASE_INOUT },
              0.34,
            )
            .to(scanner, { autoAlpha: 0, duration: 0.22 }, 1.76);
        }

        cards.forEach((card, index) => {
          const at = kind === 'signals' ? 0.42 + index * 0.31 : 0.48 + index * 0.34;
          timeline.to(nodes[index], { autoAlpha: 1, scale: 1, duration: 0.24, ease: EASE_OUT }, at);
          if (kind === 'signals') addSignalCard(timeline, card, at);
          else addPillarCard(timeline, card, at);
        });
      };

      const createMobileSequence = (
        section: HTMLElement,
        cardSelector: string,
        kind: 'signals' | 'pillars',
      ) => {
        const cards = prepareSystem(section, cardSelector, true);
        const railSignal = section.querySelector<HTMLElement>('.intro__system-signal');
        const nodes = elements(section, '.intro__system-node');
        const headerTimeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 82%', once: true },
        });

        addSystemIntro(headerTimeline, section);

        cards.forEach((card, index) => {
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 70%', once: true },
          });

          timeline
            .to(railSignal, { scaleY: (index + 1) / cards.length, duration: 0.5, ease: EASE_INOUT }, 0)
            .to(nodes[index], { autoAlpha: 1, scale: 1, duration: 0.24, ease: EASE_OUT }, 0.08);

          if (kind === 'signals') addSignalCard(timeline, card, 0.08);
          else addPillarCard(timeline, card, 0.08);
        });
      };

      gsap.from('.intro__impact-token', {
        yPercent: 112,
        duration: 1.18,
        ease: EASE_OUT,
        stagger: 0.075,
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
      });

      gsap.from('.intro__watch-kicker, .intro__watch-copy, .intro__watch-actions', {
        autoAlpha: 0,
        y: 26,
        duration: 0.92,
        ease: EASE_OUT,
        stagger: 0.075,
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
      });

      gsap.from('.intro__watch-picture-wrapper', {
        autoAlpha: 0,
        y: 58,
        scale: 0.975,
        duration: 1.25,
        ease: EASE_INOUT,
        scrollTrigger: { trigger: root, start: 'top 64%', once: true },
      });

      gsap.from('.intro__watch-chip, .intro__watch-caption', {
        autoAlpha: 0,
        y: 18,
        scale: 0.96,
        duration: 0.74,
        ease: EASE_OUT,
        stagger: 0.055,
        scrollTrigger: { trigger: '.intro__watch-picture-wrapper', start: 'top 68%', once: true },
      });

      motionMedia = gsap.matchMedia();
      motionMedia.add('(min-width: 1081px)', () => {
        if (highlightsSection) createDesktopSequence(highlightsSection, '.intro__highlight-card', 'signals');
        if (pillarsSection) createDesktopSequence(pillarsSection, '.intro__mvv-card', 'pillars');
      });
      motionMedia.add('(max-width: 1080px)', () => {
        if (highlightsSection) createMobileSequence(highlightsSection, '.intro__highlight-card', 'signals');
        if (pillarsSection) createMobileSequence(pillarsSection, '.intro__mvv-card', 'pillars');
      });

      if (hero) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
            },
          })
          .to('.intro__halo--one', { xPercent: 12, yPercent: -8, ease: 'none' }, 0)
          .to('.intro__halo--two', { xPercent: -10, yPercent: 10, ease: 'none' }, 0)
          .to('.intro__impact-title', { yPercent: -5, ease: 'none' }, 0)
          .to('.intro__watch-picture-wrapper', { yPercent: -7, ease: 'none' }, 0)
          .to('.intro__watch-picture', { yPercent: -6, scale: 1.07, rotate: -5, ease: 'none' }, 0)
          .to('.intro__watch-orbit', { rotate: 74, ease: 'none' }, 0)
          .to('.intro__watch-plate--one', { yPercent: -14, rotate: -5, ease: 'none' }, 0)
          .to('.intro__watch-plate--two', { yPercent: 10, rotate: 8, ease: 'none' }, 0)
          .to('.intro__watch-blur-after', { opacity: 0.64, ease: 'none' }, 0);
      }

      if (visual && picture && aura && plateOne && plateTwo && blur) {
        gsap.set(visual, { transformPerspective: 1100, transformStyle: 'preserve-3d' });

        const cardRotateX = gsap.quickTo(visual, 'rotateX', { duration: 0.75, ease: 'power3.out' });
        const cardRotateY = gsap.quickTo(visual, 'rotateY', { duration: 0.75, ease: 'power3.out' });
        const pictureX = gsap.quickTo(picture, 'x', { duration: 0.75, ease: 'power3.out' });
        const pictureY = gsap.quickTo(picture, 'y', { duration: 0.75, ease: 'power3.out' });
        const auraX = gsap.quickTo(aura, 'x', { duration: 0.85, ease: 'power3.out' });
        const auraY = gsap.quickTo(aura, 'y', { duration: 0.85, ease: 'power3.out' });
        const plateOneX = gsap.quickTo(plateOne, 'x', { duration: 0.65, ease: 'power3.out' });
        const plateOneY = gsap.quickTo(plateOne, 'y', { duration: 0.65, ease: 'power3.out' });
        const plateTwoX = gsap.quickTo(plateTwo, 'x', { duration: 0.7, ease: 'power3.out' });
        const plateTwoY = gsap.quickTo(plateTwo, 'y', { duration: 0.7, ease: 'power3.out' });
        const blurOpacity = gsap.quickTo(blur, 'opacity', { duration: 0.65, ease: 'power3.out' });

        const onMove = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return;

          const rect = visual.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          cardRotateX(y * -2.8);
          cardRotateY(x * 3.8);
          pictureX(x * -18);
          pictureY(y * -12);
          auraX(x * 46);
          auraY(y * 30);
          plateOneX(x * 16);
          plateOneY(y * 10);
          plateTwoX(x * -12);
          plateTwoY(y * -10);
          blurOpacity(0.56 + Math.abs(x) * 0.16);
        };

        const onLeave = () => {
          cardRotateX(0);
          cardRotateY(0);
          pictureX(0);
          pictureY(0);
          auraX(0);
          auraY(0);
          plateOneX(0);
          plateOneY(0);
          plateTwoX(0);
          plateTwoY(0);
          blurOpacity(0.52);
        };

        visual.addEventListener('pointermove', onMove);
        visual.addEventListener('pointerleave', onLeave);
        cleanup = () => {
          visual.removeEventListener('pointermove', onMove);
          visual.removeEventListener('pointerleave', onLeave);
        };
      }
    }, root);

    return () => {
      cleanup();
      motionMedia?.revert();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={rootRef} id="about" className="section intro intro--watch" aria-labelledby="intro-heading">
      <div className="intro__ambient" aria-hidden="true">
        <span className="intro__halo intro__halo--one" />
        <span className="intro__halo intro__halo--two" />
        <span className="intro__beam" />
        <span className="intro__beam intro__beam--slow" />
      </div>

      <div className="container intro__container">
        <div className="intro__watch-hero">
          <div className="intro__watch-head">
            <p className="intro__watch-kicker eyebrow t-label">About Solu1ions</p>

            <h2 id="intro-heading" className="intro__impact-title" aria-label="We strategize, design, and launch to impact">
              <span className="intro__impact-mask">
                <span className="intro__impact-token intro__impact-word intro__impact-word--we">we</span>
              </span>
              <span className="intro__impact-mask intro__impact-mask--media">
                <span className="intro__impact-token intro__impact-slot" aria-hidden="true">
                  {impactWords.map(([word, image]) => (
                    <span key={word} className="intro__impact-slide">
                      <img src={image} alt="" loading="lazy" decoding="async" />
                      <span>{word}</span>
                    </span>
                  ))}
                </span>
              </span>
              <span className="intro__impact-mask">
                <span className="intro__impact-token intro__impact-word">to</span>
              </span>
              <span className="intro__impact-mask">
                <span className="intro__impact-token intro__impact-word intro__impact-word--impact">impact</span>
              </span>
            </h2>

            <p className="intro__watch-copy">
              Solu1ions brings strategy, marketing, creative direction, and digital execution into one focused
              operating rhythm.
            </p>

            <div className="intro__watch-actions">
              <a
                href="#services"
                className="arrow-link intro__watch-action"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId('#services');
                }}
              >
                See the system <span className="arrow" aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </div>

          <div ref={visualRef} className="intro__watch-picture-wrapper" data-cursor="Move">
            <span className="intro__watch-aura" aria-hidden="true" />
            <span className="intro__watch-orbit" aria-hidden="true" />
            <span className="intro__watch-grid" aria-hidden="true" />

            <picture className="intro__watch-picture intro__watch-blur-hero" aria-hidden="true">
              <source srcSet={markChrome} media="(min-width: 0px)" />
              <img className="intro__watch-image" src={markChrome} alt="" loading="lazy" decoding="async" />
            </picture>

            <span className="intro__watch-blur-after" aria-hidden="true" />
            <span className="intro__watch-vignette" aria-hidden="true" />

            <img className="intro__watch-sketch" src={logoSketches} alt="" loading="lazy" decoding="async" />
            <img className="intro__watch-fan" src={patternChrome} alt="" loading="lazy" decoding="async" />

            <span className="intro__watch-plate intro__watch-plate--one" aria-hidden="true" />
            <span className="intro__watch-plate intro__watch-plate--two" aria-hidden="true" />

            <ul className="intro__watch-chips" aria-hidden="true">
              {systemNodes.map(([index, label]) => (
                <li key={label} className="intro__watch-chip">
                  <span>{index}</span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="intro__watch-caption" aria-hidden="true">
              <span className="t-label">Operating rhythm</span>
              <strong className="t-display">One clear system</strong>
            </div>
          </div>
        </div>

        <section className="intro__system intro__highlights" aria-labelledby="intro-highlights-heading">
          <StructuralBackdrop />
          <SystemHeader id="intro-highlights-heading" eyebrow="Get the highlights." count="04 signals" />
          <SystemRail count={4} scanner />

          <div className="intro__highlight-grid" role="list">
            {highlights.map(([index, label, point, kind]) => (
              <article
                key={label}
                className="intro__system-card intro__highlight-card"
                data-signal-kind={kind}
                role="listitem"
              >
                <CardFrame />
                <span className="intro__card-signal" aria-hidden="true" />
                <span className="intro__system-index intro__highlight-index t-label">{index}</span>
                <SignalMicro kind={kind} />
                <MaskedTitle label={label} className="intro__highlight-title" />
                <p className="intro__system-description">{point}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="intro__system intro__mvv" aria-labelledby="intro-pillars-heading">
          <StructuralBackdrop />
          <SystemHeader id="intro-pillars-heading" eyebrow="Mission / Vision / Values" count="03 pillars" />
          <SystemRail count={3} />

          <div className="intro__mvv-grid" role="list">
            <article
              className="intro__system-card intro__mvv-card"
              data-pillar-kind="vision"
              role="listitem"
            >
              <CardFrame />
              <span className="intro__card-signal" aria-hidden="true" />
              <span className="intro__system-index intro__mvv-index t-label">01</span>
              <MaskedTitle label="Vision" className="intro__mvv-title" />
              <p className="intro__system-description">{VISION}</p>
            </article>

            <article
              className="intro__system-card intro__mvv-card"
              data-pillar-kind="mission"
              role="listitem"
            >
              <CardFrame />
              <span className="intro__card-signal" aria-hidden="true" />
              <span className="intro__system-index intro__mvv-index t-label">02</span>
              <MaskedTitle label="Mission" className="intro__mvv-title intro__mvv-title--mission" />
              <p className="intro__system-description">{MISSION}</p>
            </article>

            <article
              className="intro__system-card intro__mvv-card intro__mvv-card--values"
              data-pillar-kind="values"
              role="listitem"
            >
              <CardFrame />
              <span className="intro__card-signal" aria-hidden="true" />
              <span className="intro__system-index intro__mvv-index t-label">03</span>
              <MaskedTitle label="Values" className="intro__mvv-title" />
              <ul className="intro__value-list" aria-label="Solu1ions values">
                {VALUES.map((value) => (
                  <li key={value.index} className="intro__value-chip">
                    <span className="intro__value-index">{value.index}</span>
                    <span className="intro__value-name">{value.name}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
