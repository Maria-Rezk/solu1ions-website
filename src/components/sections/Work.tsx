import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { Project } from '../../types';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { SplitLines } from '../motion/SplitLines';
import { useCurvedReveal } from '../../hooks/useCurvedReveal';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PROJECTS } from '../../data/projects';
import chromeFan from '../../assets/pattern-chrome.webp';

const AUTOPLAY_MS = 6000;
const SLIDE_DURATION = 0.85;
const DRAG_CLICK_THRESHOLD = 8;
const FLICK_VELOCITY = 0.5; // px per ms

/**
 * Branded placeholder used until real case-study media is supplied
 * (`project.media === null`) — a tinted brand surface, the chrome fan, and an
 * honest "in production" tag, so nothing pretends to be a photo that doesn't
 * exist yet.
 */
function ProjectVisual({ project, index }: { project: Project; index: number }) {
  if (project.media) {
    return (
      <img
        src={project.media.src}
        alt={project.media.alt}
        loading="lazy"
        decoding="async"
        className="wcard__img"
      />
    );
  }
  return (
    <div className="wcard__placeholder" style={{ background: project.tint }} aria-hidden="true">
      <img src={chromeFan} alt="" loading="lazy" decoding="async" className="wcard__fan" />
      <span className="wcard__number t-display">{String(index + 1).padStart(2, '0')}</span>
      <span className="wcard__ptag t-label">Case study — in production</span>
    </div>
  );
}

/**
 * Selected Work — a large editorial highlights carousel: one featured project
 * card at a time with the next card peeking on the right. Drag, swipe,
 * trackpad, keyboard, and pagination all snap one project per action;
 * controlled autoplay pauses on hover, focus, drag, hidden tab, and while the
 * section is off screen. Finite track, GSAP-tweened transform only.
 */
export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const count = PROJECTS.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [controlsHidden, setControlsHidden] = useState(false);

  const indexRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, velocity: 0 });

  /* The light panel rises over the previous section with un-rounding corners —
     the same curtain language the footer uses, so the two bookend the page. */
  useCurvedReveal(sectionRef, { radius: 72 });

  const getStep = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>('.wcard');
    if (!track || !card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  }, []);

  const animateCardIn = useCallback(
    (i: number) => {
      const card = trackRef.current?.children[i] as HTMLElement | undefined;
      if (!card || reduced) return;

      const info = card.querySelectorAll('.wcard__meta > *');
      const media = card.querySelector('.wcard__media');
      gsap.fromTo(
        info,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE_OUT, stagger: 0.06, delay: 0.12, overwrite: 'auto' },
      );
      if (media) {
        gsap.fromTo(media, { scale: 0.97 }, { scale: 1, duration: 0.8, ease: EASE_OUT, overwrite: 'auto' });
      }
    },
    [reduced],
  );

  const goTo = useCallback(
    (next: number, animate = true) => {
      const track = trackRef.current;
      if (!track) return;

      const clamped = Math.max(0, Math.min(count - 1, next));
      const changed = clamped !== indexRef.current;
      const x = -clamped * getStep();
      indexRef.current = clamped;
      setIndex(clamped);
      tweenRef.current?.kill();

      if (reduced || !animate) {
        gsap.set(track, { x });
      } else {
        tweenRef.current = gsap.to(track, { x, duration: SLIDE_DURATION, ease: EASE_OUT });
        if (changed) animateCardIn(clamped);
      }
    },
    [count, reduced, getStep, animateCardIn],
  );

  /* Keep the track aligned across resizes without animating. */
  useLayoutEffect(() => {
    const onResize = () => goTo(indexRef.current, false);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      tweenRef.current?.kill();
    };
  }, [goTo]);

  /* Trackpad horizontal gestures: one confident swipe advances one project. */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let accum = 0;
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // let vertical scroll pass
      e.preventDefault();
      const now = performance.now();
      if (now < lockUntil) return;
      accum += e.deltaX;
      if (Math.abs(accum) > 70) {
        const dir = accum > 0 ? 1 : -1;
        accum = 0;
        lockUntil = now + 750;
        goTo(indexRef.current + dir);
      }
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, [goTo]);

  /* Autoplay suspends while dragging, off screen, or the tab is hidden; any
     index change resets the visible timer. Hover/focus no longer disable it
     because the dotnav timer should remain visible while users inspect it. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* Apple-style gallery chrome: hide the controls on downward page scroll,
     bring them back when the user scrolls upward or leaves the section. */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateControlsVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      const section = sectionRef.current;
      const rect = section?.getBoundingClientRect();
      const sectionIsNearby = Boolean(rect && rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08);

      if (!sectionIsNearby || currentY < 8) {
        setControlsHidden(false);
      } else if (delta > 8) {
        setControlsHidden(true);
      } else if (delta < -8) {
        setControlsHidden(false);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateControlsVisibility);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const suspended = dragging || !inView || !tabVisible;

  useEffect(() => {
    if (reduced || !playing || suspended) return;
    const timer = setTimeout(() => goTo((indexRef.current + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [reduced, playing, suspended, index, count, goTo]);

  /* Pointer dragging — mouse and touch share one path. `touch-action: pan-y`
     keeps vertical page scrolling native on touch. */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    tweenRef.current?.kill();
    const s = drag.current;
    s.active = true;
    s.moved = false;
    s.startX = e.clientX;
    s.startPos = Number(gsap.getProperty(track, 'x'));
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.velocity = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = drag.current;
    const track = trackRef.current;
    if (!s.active || !track) return;

    const dx = e.clientX - s.startX;
    if (Math.abs(dx) > DRAG_CLICK_THRESHOLD) s.moved = true;

    const now = performance.now();
    if (now - s.lastT > 12) {
      s.velocity = (e.clientX - s.lastX) / (now - s.lastT);
      s.lastX = e.clientX;
      s.lastT = now;
    }

    const min = -(count - 1) * getStep();
    let x = s.startPos + dx;
    if (x > 0) x *= 0.35;
    else if (x < min) x = min + (x - min) * 0.35;
    gsap.set(track, { x });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = drag.current;
    if (!s.active) return;
    s.active = false;
    setDragging(false);

    const dx = e.clientX - s.startX;
    const step = getStep();
    let target = indexRef.current;
    if (dx < -step * 0.16 || s.velocity < -FLICK_VELOCITY) target += 1;
    else if (dx > step * 0.16 || s.velocity > FLICK_VELOCITY) target -= 1;
    goTo(target);
  };

  /* A real drag never doubles as a click on card content. */
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(indexRef.current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(indexRef.current - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="work work--panel section--light on-light"
      aria-labelledby="work-heading"
    >
      <div className="container work__head">
        <p className="eyebrow t-label">Selected work</p>
        <SplitLines as="h2" id="work-heading" className="work__title t-display">
          Work we <em className="t-accent t-italic">stand behind.</em>
        </SplitLines>
        <p className="work__note t-muted">
          A selection of recent engagements. Full case studies are being prepared for release.
        </p>
      </div>

      <div
        className="work__carousel"
        role="group"
        aria-roledescription="carousel"
        aria-label="Selected work projects"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          ref={viewportRef}
          className={`work__viewport${dragging ? ' is-dragging' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div ref={trackRef} className="work__track">
            {PROJECTS.map((project, i) => (
              <article
                key={project.id}
                id={`work-gallery-item-${i + 1}`}
                className={`wcard${i === index ? ' is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Project ${i + 1} of ${count}: ${project.project}`}
              >
                <div className="wcard__meta">
                  <p className="wcard__category t-label t-accent">{project.category}</p>
                  <h3 className="wcard__title t-display">{project.project}</h3>
                  <p className="wcard__client">
                    {project.client} <span className="t-muted">— {project.year}</span>
                  </p>
                  <ul className="wcard__services" aria-label="Services delivered">
                    {project.services.map((s) => (
                      <li key={s} className="wcard__chip t-label">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="wcard__media" data-cursor="View">
                  <ProjectVisual project={project} index={i} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div
          className={`work__controls${controlsHidden ? ' is-hidden' : ''}`}
          aria-label="Selected work controls"
          aria-hidden={controlsHidden || undefined}
        >
          <div
            className={`work__dotnav${playing && !reduced && !suspended ? ' is-timing' : ''}`}
            role="tablist"
            aria-label="Choose project"
            style={{ '--work-autoplay-duration': `${AUTOPLAY_MS}ms` } as CSSProperties}
          >
            {PROJECTS.map((project, i) => (
              <button
                key={project.id}
                id={`work-gallery-item-${i + 1}-trigger`}
                type="button"
                className={`work__dotnav-link${i === index ? ' is-active' : ''}`}
                role="tab"
                aria-controls={`work-gallery-item-${i + 1}`}
                aria-selected={i === index}
                tabIndex={controlsHidden ? -1 : i === index ? 0 : -1}
                onClick={() => goTo(i)}
              >
                <span className="sr-only">{project.project}</span>
              </button>
            ))}
          </div>

          {!reduced && (
            <button
              type="button"
              className="work__gallery-toggle"
              aria-label={playing ? 'Pause automatic rotation' : 'Start automatic rotation'}
              tabIndex={controlsHidden ? -1 : undefined}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <rect x="3.25" y="2.75" width="3.25" height="10.5" rx="0.8" fill="currentColor" />
                  <rect x="9.5" y="2.75" width="3.25" height="10.5" rx="0.8" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M4.5 2.75v10.5L12.5 8z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
        </div>

        <p className="sr-only" aria-live={playing && !reduced ? 'off' : 'polite'}>
          Project {index + 1} of {count}: {PROJECTS[index].project}, {PROJECTS[index].client}
        </p>
      </div>
    </section>
  );
}
