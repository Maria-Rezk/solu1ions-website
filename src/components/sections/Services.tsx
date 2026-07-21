import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { SERVICE_CATEGORIES } from '../../data/services';
import {
  BRAND_PIECE_MOTIONS,
  type BrandPieceLayer,
  type BrandPieceMotion,
} from '../../data/serviceAssembly';
import patternUnit from '../../assets/brand/pattern-unit.svg';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { getLenis, scrollToId } from '../../lib/scroll';
import { Logo } from '../layout/Logo';

const PINNED_QUERY = '(min-width: 960px) and (min-height: 700px)';
const FLOW_QUERY = '(max-width: 959px), (max-height: 699px)';
const SERVICE_SELECT_EVENT = 'services:select';

type PiecePhase = 'start' | 'mid' | 'end';

interface AssemblyGeometry {
  width: number;
  height: number;
  originX: number;
  originY: number;
}

function subscribePinnedLayout(callback: () => void): () => void {
  const query = window.matchMedia(PINNED_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getPinnedLayoutSnapshot(): boolean {
  return window.matchMedia(PINNED_QUERY).matches;
}

function serviceName(title: [string, string]): string {
  return `${title[0]} ${title[1]}`;
}

function pieceLayer(layer: BrandPieceLayer) {
  return BRAND_PIECE_MOTIONS.filter((piece) => piece.layer === layer);
}

function PieceLayer({ layer }: { layer: BrandPieceLayer }) {
  return (
    <div className={`services-assembly__pieces services-assembly__pieces--${layer}`} aria-hidden="true">
      {pieceLayer(layer).map((motion) => (
        <span
          key={motion.id}
          className={`services-assembly__piece services-assembly__piece--${motion.variant}`}
          data-piece-id={motion.id}
          data-compact={motion.compact || undefined}
          data-mobile={motion.mobile || undefined}
        >
          <img src={patternUnit} alt="" draggable={false} />
        </span>
      ))}
    </div>
  );
}

export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const pinnedLayout = useSyncExternalStore(
    subscribePinnedLayout,
    getPinnedLayoutSnapshot,
    () => false,
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stage = root.querySelector<HTMLElement>('.services-system__stage');
    const navigation = root.querySelector<HTMLElement>('.services-system__navigation');
    const eyebrow = root.querySelector<HTMLElement>('.services-system__eyebrow');
    const mark = root.querySelector<HTMLElement>('.services-assembly__mark');
    const markFold = mark?.querySelector<SVGElement>('svg > :last-child');
    const headlineLines = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.services-system__headline-line'),
    );
    const rows = gsap.utils.toArray<HTMLButtonElement>(
      root.querySelectorAll('.services-system__item'),
    );
    const serviceNodes = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.services-system__service-node'),
    );
    const descriptions = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.services-system__description'),
    );
    const underlines = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.services-system__underline'),
    );
    const signalBase = root.querySelector<HTMLElement>('.services-system__signal-base');
    const signalLine = root.querySelector<HTMLElement>('.services-system__signal-line');
    const signalNode = root.querySelector<HTMLElement>('.services-system__signal-node');
    const connector = root.querySelector<HTMLElement>('.services-system__connector');
    const railProgress = root.querySelector<HTMLElement>('.services-assembly__rail-progress');
    const finalStatement = root.querySelector<HTMLElement>('.services-system__final-statement');
    const cta = root.querySelector<HTMLElement>('.services-system__cta');
    const pieceElements = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.services-assembly__piece'),
    );
    const piecesById = new Map(
      pieceElements.map((piece) => [Number(piece.dataset.pieceId), piece]),
    );

    if (
      !stage ||
      !navigation ||
      !eyebrow ||
      !mark ||
      !markFold ||
      !signalBase ||
      !signalLine ||
      !signalNode ||
      !connector ||
      !railProgress ||
      !finalStatement ||
      !cta ||
      rows.length !== SERVICE_CATEGORIES.length ||
      serviceNodes.length !== SERVICE_CATEGORIES.length ||
      descriptions.length !== SERVICE_CATEGORIES.length ||
      pieceElements.length !== BRAND_PIECE_MOTIONS.length
    ) {
      return;
    }

    let geometry: AssemblyGeometry = { width: 0, height: 0, originX: 0, originY: 0 };

    const measureAssembly = () => {
      const stageRect = stage.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      geometry = {
        width: stageRect.width,
        height: stageRect.height,
        originX: markRect.left - stageRect.left + markRect.width * 0.56,
        originY: markRect.top - stageRect.top + markRect.height * 0.3,
      };
    };

    const compactFactor = () => {
      if (window.innerWidth < 640) return 0.55;
      if (window.innerWidth < 960) return 0.78;
      if (window.innerWidth < 1200) return 0.9;
      return 1;
    };

    const piecePoint = (motion: BrandPieceMotion, phase: PiecePhase, factor: number) => {
      const configuredX = geometry.originX + (geometry.width * motion[`${phase}X`]) / 100 * factor;
      const y = geometry.originY + (geometry.height * motion[`${phase}Y`]) / 100;

      if (window.innerWidth >= 960 || phase === 'start') return { x: configuredX, y };

      const edgeInset = window.innerWidth < 640 ? 14 : 22;
      const restingX = motion.id % 2 === 0
        ? geometry.width - edgeInset - 34 - (motion.id % 3) * 7
        : edgeInset + (motion.id % 3) * 7;
      const x = phase === 'mid'
        ? geometry.originX + (restingX - geometry.originX) * 0.58
        : restingX;

      return { x, y };
    };

    const setPiecesAtStart = (factor: number) => {
      BRAND_PIECE_MOTIONS.forEach((motion) => {
        const piece = piecesById.get(motion.id);
        if (!piece) return;
        const point = piecePoint(motion, 'start', factor);
        gsap.set(piece, {
          x: point.x,
          y: point.y,
          rotation: motion.startRotation,
          scale: motion.scale * 0.72,
          autoAlpha: 0,
          force3D: true,
        });
      });
    };

    const setPiecesAtEnd = (factor: number) => {
      BRAND_PIECE_MOTIONS.forEach((motion) => {
        const piece = piecesById.get(motion.id);
        if (!piece) return;
        const point = piecePoint(motion, 'end', factor);
        gsap.set(piece, {
          x: point.x,
          y: point.y,
          rotation: motion.endRotation,
          scale: motion.scale,
          autoAlpha: 1,
          force3D: true,
        });
      });
    };

    const syncAccessibleActive = (index: number) => {
      rows.forEach((row, rowIndex) => {
        const active = rowIndex === index;
        row.classList.toggle('is-active', active);
        if (active) row.setAttribute('aria-current', 'true');
        else row.removeAttribute('aria-current');

        const node = serviceNodes[rowIndex];
        node?.classList.toggle('is-active', active);
        node?.classList.toggle('is-complete', rowIndex < index);
      });

      descriptions.forEach((description, descriptionIndex) => {
        description.setAttribute('aria-hidden', String(descriptionIndex !== index));
      });
    };

    if (reduced) {
      root.classList.add('is-reduced');
      measureAssembly();
      const navigationRect = navigation.getBoundingClientRect();
      const reducedSignalPositions = rows.map((row) => {
        const rowRect = row.getBoundingClientRect();
        return rowRect.top - navigationRect.top + rowRect.height / 2;
      });
      const reducedSignalStart = reducedSignalPositions[0] ?? 0;
      const reducedSignalEnd = reducedSignalPositions.at(-1) ?? reducedSignalStart;
      gsap.set([signalBase, signalLine], {
        y: reducedSignalStart,
        height: Math.max(1, reducedSignalEnd - reducedSignalStart),
      });
      setPiecesAtEnd(compactFactor());
      syncAccessibleActive(0);
      descriptions.forEach((description) => description.setAttribute('aria-hidden', 'false'));
      gsap.set(
        [eyebrow, mark, ...headlineLines, ...rows, ...descriptions, signalBase, signalLine, finalStatement, cta],
        { autoAlpha: 1, x: 0, y: 0, scale: 1 },
      );
      gsap.set([signalLine, railProgress], { scaleX: 1, scaleY: 1 });

      const selectWithoutMotion = (event: Event) => {
        const index = (event as CustomEvent<number>).detail;
        if (index < 0 || index >= rows.length) return;
        syncAccessibleActive(index);
        descriptions.forEach((description) => description.setAttribute('aria-hidden', 'false'));
      };
      root.addEventListener(SERVICE_SELECT_EVENT, selectWithoutMotion);

      return () => {
        root.removeEventListener(SERVICE_SELECT_EVENT, selectWithoutMotion);
        root.classList.remove('is-reduced');
        gsap.set(
          [eyebrow, mark, ...headlineLines, ...rows, ...descriptions, signalBase, signalLine, finalStatement, cta, railProgress, ...pieceElements],
          { clearProps: 'all' },
        );
      };
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const prepareIntro = () => {
        syncAccessibleActive(0);
        gsap.set(eyebrow, { autoAlpha: 0, y: 12 });
        gsap.set(headlineLines, { yPercent: 110 });
        gsap.set(mark, { autoAlpha: 0, y: -25 });
        gsap.set(markFold, { x: 0, y: 0, transformOrigin: '50% 50%' });
        gsap.set(rows, { autoAlpha: 0.28, x: 16 });
        gsap.set(underlines, { scaleX: 0, transformOrigin: 'left' });
        gsap.set(descriptions, { display: 'block', autoAlpha: 0, y: 14 });
        gsap.set([signalBase, signalNode, connector], { autoAlpha: 0 });
        gsap.set(signalLine, { autoAlpha: 0, scaleY: 0, transformOrigin: 'top' });
        gsap.set(connector, { scaleX: 0, transformOrigin: 'left' });
        gsap.set(railProgress, { scaleX: 0, transformOrigin: 'left' });
        gsap.set([finalStatement, cta], { autoAlpha: 0, y: 14 });
      };

      if (pinnedLayout) media.add(PINNED_QUERY, () => {
        root.classList.remove('is-flow');
        root.classList.add('is-pinned');
        let activeIndex = 0;
        let signalPositions = rows.map(() => 0);
        let master: ReturnType<typeof gsap.timeline>;
        const factor = compactFactor();

        const measureSignalPositions = () => {
          const navigationRect = navigation.getBoundingClientRect();
          signalPositions = rows.map((row) => {
            const rowRect = row.getBoundingClientRect();
            return rowRect.top - navigationRect.top + rowRect.height / 2;
          });
          const start = signalPositions[0] ?? 0;
          const length = Math.max(1, (signalPositions.at(-1) ?? start) - start);
          gsap.set([signalBase, signalLine], { y: start, height: length });
        };

        const signalY = (index: number) => () => signalPositions[index] ?? 0;
        const updateSemanticStage = () => {
          const time = master.time();
          const stageTimes = [
            master.labels['service-01'],
            master.labels['service-02'],
            master.labels['service-03'],
            master.labels['service-04'],
          ];
          const nextIndex = time >= stageTimes[3]
            ? 3
            : time >= stageTimes[2]
              ? 2
              : time >= stageTimes[1]
                ? 1
                : 0;
          if (nextIndex === activeIndex) return;
          activeIndex = nextIndex;
          syncAccessibleActive(nextIndex);
        };

        const addPieceStage = (serviceStage: 1 | 2 | 3 | 4, at: number) => {
          BRAND_PIECE_MOTIONS.filter((motion) => motion.serviceStage === serviceStage).forEach((motion) => {
            const piece = piecesById.get(motion.id);
            if (!piece) return;
            const releaseAt = at + motion.delay;
            const fallDuration = motion.duration * 0.48;
            const settleDuration = motion.duration - fallDuration;

            master
              .set(piece, { willChange: 'transform, opacity' }, releaseAt)
              .to(
                piece,
                {
                  autoAlpha: motion.variant === 'outline' ? 0.56 : 0.88,
                  x: () => piecePoint(motion, 'mid', factor).x,
                  y: () => piecePoint(motion, 'mid', factor).y,
                  rotation: motion.midRotation,
                  scale: motion.scale,
                  duration: fallDuration,
                  ease: 'power2.in',
                  force3D: true,
                },
                releaseAt,
              )
              .to(
                piece,
                {
                  x: () => piecePoint(motion, 'end', factor).x,
                  y: () => piecePoint(motion, 'end', factor).y,
                  rotation: motion.endRotation,
                  duration: settleDuration,
                  ease: 'power3.out',
                  force3D: true,
                },
                releaseAt + fallDuration,
              )
              .set(piece, { willChange: 'auto' }, releaseAt + motion.duration);
          });
        };

        measureAssembly();
        measureSignalPositions();
        prepareIntro();
        setPiecesAtStart(factor);

        master = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onUpdate: updateSemanticStage,
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 1200 ? 2.6 : 3.15))}`,
            pin: stage,
            pinSpacing: true,
            scrub: 0.82,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measureAssembly();
              measureSignalPositions();
              gsap.set([signalNode, connector], { y: signalY(activeIndex) });
            },
          },
        });

        master
          .addLabel('intro', 0)
          .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
          .to(headlineLines, { yPercent: 0, duration: 0.8, stagger: 0.1 }, 0.08)
          .to(mark, { autoAlpha: 1, y: 0, duration: 0.88 }, 0.14)
          .to(markFold, { x: -4, y: 5, duration: 0.28, ease: 'power2.out' }, 0.54)
          .to(markFold, { x: 0, y: 0, duration: 0.34, ease: 'power3.out' }, 0.82)
          .addLabel('service-01', 0.76)
          .to(signalBase, { autoAlpha: 0.5, duration: 0.3 }, 0.7)
          .to(signalLine, { autoAlpha: 1, scaleY: 0.02, duration: 0.28 }, 0.76)
          .to(signalNode, { autoAlpha: 1, y: signalY(0), duration: 0.28 }, 0.76)
          .to(connector, { autoAlpha: 1, y: signalY(0), scaleX: 1, duration: 0.4 }, 0.82)
          .to(rows[0], { autoAlpha: 1, x: 0, duration: 0.5 }, 0.8)
          .to(underlines[0], { scaleX: 1, duration: 0.42 }, 0.88)
          .to(descriptions[0], { autoAlpha: 1, y: 0, duration: 0.42 }, 0.84)
          .to(railProgress, { scaleX: 0.18, duration: 0.65, ease: 'power2.inOut' }, 0.84);
        addPieceStage(1, 0.82);

        const addServiceTransition = (index: number, at: number) => {
          const previous = index - 1;
          const progress = index / 3;

          master
            .addLabel(`service-0${index + 1}`, at)
            .to(connector, { scaleX: 0, duration: 0.16, ease: 'power2.out' }, at)
            .to(underlines[previous], { scaleX: 0, duration: 0.18, ease: 'power2.out' }, at)
            .to(rows[previous], { autoAlpha: 0.28, x: 16, duration: 0.34 }, at + 0.02)
            .to(descriptions[previous], { autoAlpha: 0, y: -12, duration: 0.27, ease: 'power2.out' }, at)
            .to(signalLine, { scaleY: progress, duration: 0.46, ease: 'power3.inOut' }, at + 0.1)
            .to(
              [signalNode, connector],
              { y: signalY(index), duration: 0.44, ease: 'power3.inOut' },
              at + 0.14,
            )
            .set(descriptions[index], { y: 14 }, at + 0.4)
            .to(rows[index], { autoAlpha: 1, x: 0, duration: 0.5 }, at + 0.4)
            .to(descriptions[index], { autoAlpha: 1, y: 0, duration: 0.42 }, at + 0.46)
            .to(connector, { scaleX: 1, duration: 0.36 }, at + 0.48)
            .to(underlines[index], { scaleX: 1, duration: 0.4 }, at + 0.56)
            .to(railProgress, { scaleX: (index + 1) / 4, duration: 0.72, ease: 'power2.inOut' }, at + 0.08);

          addPieceStage((index + 1) as 2 | 3 | 4, at + 0.05);
        };

        addServiceTransition(1, 1.72);
        addServiceTransition(2, 2.7);
        addServiceTransition(3, 3.68);

        master
          .addLabel('final-system', 4.58)
          .to(railProgress, { scaleX: 1, duration: 0.54, ease: 'power2.out' }, 4.58)
          .to(finalStatement, { autoAlpha: 1, y: 0, duration: 0.48 }, 4.68)
          .to(cta, { autoAlpha: 1, y: 0, duration: 0.46 }, 4.8)
          .to({}, { duration: 0.48 }, 5.02);

        const selectPinnedService = (event: Event) => {
          const index = (event as CustomEvent<number>).detail;
          const trigger = master.scrollTrigger;
          if (!trigger || index < 0 || index >= rows.length) return;

          trigger.refresh();
          const labels = ['service-01', 'service-02', 'service-03', 'service-04'];
          const targetTime = master.labels[labels[index]] + (index === 0 ? 0.38 : 0.56);
          const progress = targetTime / master.duration();
          const targetScroll = trigger.start + (trigger.end - trigger.start) * progress;
          const lenis = getLenis();

          if (lenis) lenis.scrollTo(targetScroll, { duration: 0.9 });
          else window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        };
        root.addEventListener(SERVICE_SELECT_EVENT, selectPinnedService);
        const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          root.classList.remove('is-pinned');
          window.cancelAnimationFrame(refreshFrame);
          root.removeEventListener(SERVICE_SELECT_EVENT, selectPinnedService);
          master.scrollTrigger?.kill(true);
          master.kill();
          syncAccessibleActive(0);
        };
      });

      if (!pinnedLayout) media.add(FLOW_QUERY, () => {
        root.classList.remove('is-pinned');
        root.classList.add('is-flow');
        let activeIndex = -1;
        let transition: ReturnType<typeof gsap.timeline> | null = null;
        const pieceTimelines: Array<ReturnType<typeof gsap.timeline>> = [];
        const releasedStages = new Set<number>();
        const factor = compactFactor();

        const measureSignalY = (index: number) => {
          const navigationRect = navigation.getBoundingClientRect();
          const rowRect = rows[index].getBoundingClientRect();
          return rowRect.top - navigationRect.top + rowRect.height / 2;
        };

        const measureFlowGeometry = () => {
          measureAssembly();
          const start = measureSignalY(0);
          const end = measureSignalY(rows.length - 1);
          gsap.set([signalBase, signalLine], { y: start, height: Math.max(1, end - start) });
        };

        const releaseCompactPieces = (serviceStage: 1 | 2 | 3 | 4) => {
          if (releasedStages.has(serviceStage)) return;
          releasedStages.add(serviceStage);

          BRAND_PIECE_MOTIONS.filter(
            (motion) => motion.serviceStage === serviceStage && motion.mobile,
          ).forEach((motion) => {
            const piece = piecesById.get(motion.id);
            if (!piece) return;
            const timeline = gsap.timeline({ delay: motion.delay * 0.35 });
            const fallDuration = motion.duration * 0.48;
            timeline
              .set(piece, { willChange: 'transform, opacity' })
              .to(piece, {
                autoAlpha: motion.variant === 'outline' ? 0.5 : 0.82,
                x: () => piecePoint(motion, 'mid', factor).x,
                y: () => piecePoint(motion, 'mid', factor).y,
                rotation: motion.midRotation,
                scale: motion.scale,
                duration: fallDuration,
                ease: 'power2.in',
                force3D: true,
              })
              .to(piece, {
                x: () => piecePoint(motion, 'end', factor).x,
                y: () => piecePoint(motion, 'end', factor).y,
                rotation: motion.endRotation,
                duration: motion.duration - fallDuration,
                ease: 'power3.out',
                force3D: true,
              })
              .set(piece, { willChange: 'auto' });
            pieceTimelines.push(timeline);
          });
        };

        measureFlowGeometry();
        prepareIntro();
        setPiecesAtStart(factor);
        gsap.set(rows, { autoAlpha: 0.46, x: 8 });
        gsap.set([signalBase, signalNode, connector], { autoAlpha: 1 });
        gsap.set(signalLine, { autoAlpha: 1, scaleY: 0 });
        gsap.set([signalNode, connector], { y: () => measureSignalY(0) });

        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: root, start: 'top 82%', once: true },
          })
          .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
          .to(headlineLines, { yPercent: 0, duration: 0.8, stagger: 0.1 }, 0.08)
          .to(mark, { autoAlpha: 1, y: 0, duration: 0.86 }, 0.16)
          .to(markFold, { x: -3, y: 4, duration: 0.26, ease: 'power2.out' }, 0.58)
          .to(markFold, { x: 0, y: 0, duration: 0.32 }, 0.82);

        const activateRow = (index: number) => {
          if (index === activeIndex) return;
          const previous = activeIndex;
          activeIndex = index;
          syncAccessibleActive(index);
          transition?.kill();
          releaseCompactPieces((index + 1) as 1 | 2 | 3 | 4);

          transition = gsap.timeline({ defaults: { overwrite: 'auto' } });
          if (previous >= 0) {
            transition
              .to(connector, { scaleX: 0, duration: 0.14, ease: 'power2.out' }, 0)
              .to(underlines[previous], { scaleX: 0, duration: 0.16, ease: 'power2.out' }, 0)
              .to(rows[previous], { autoAlpha: 0.46, x: 8, duration: 0.28, ease: 'power2.out' }, 0);
          }

          transition
            .to(signalLine, { scaleY: index === 0 ? 0.02 : index / 3, duration: 0.38, ease: 'power3.inOut' }, 0.08)
            .to(
              [signalNode, connector],
              { y: () => measureSignalY(index), duration: 0.36, ease: 'power3.inOut' },
              0.1,
            )
            .to(rows[index], { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' }, 0.34)
            .to(connector, { scaleX: 1, duration: 0.3, ease: 'power3.out' }, 0.38)
            .to(underlines[index], { scaleX: 1, duration: 0.34, ease: 'power3.out' }, 0.44);

          if (index === rows.length - 1) {
            transition
              .to(finalStatement, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.5)
              .to(cta, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.58);
          }
        };

        const rowTriggers = rows.map((row, index) =>
          ScrollTrigger.create({
            trigger: row,
            start: 'top 68%',
            end: 'bottom 48%',
            onEnter: () => activateRow(index),
            onEnterBack: () => activateRow(index),
          }),
        );

        const finalTrigger = ScrollTrigger.create({
          trigger: finalStatement,
          start: 'top 86%',
          onEnter: () => {
            gsap.to([finalStatement, cta], { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08 });
          },
        });

        const onResize = () => {
          measureFlowGeometry();
          BRAND_PIECE_MOTIONS.filter(
            (motion) => motion.mobile && releasedStages.has(motion.serviceStage),
          ).forEach((motion) => {
            const piece = piecesById.get(motion.id);
            if (!piece) return;
            const point = piecePoint(motion, 'end', compactFactor());
            gsap.set(piece, { x: point.x, y: point.y });
          });
        };
        window.addEventListener('resize', onResize);

        const selectFlowService = (event: Event) => {
          const index = (event as CustomEvent<number>).detail;
          if (index >= 0 && index < rows.length) activateRow(index);
        };
        root.addEventListener(SERVICE_SELECT_EVENT, selectFlowService);
        const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          root.classList.remove('is-flow');
          window.cancelAnimationFrame(refreshFrame);
          window.removeEventListener('resize', onResize);
          root.removeEventListener(SERVICE_SELECT_EVENT, selectFlowService);
          transition?.kill();
          pieceTimelines.forEach((timeline) => timeline.kill());
          rowTriggers.forEach((trigger) => trigger.kill());
          finalTrigger.kill();
          syncAccessibleActive(0);
        };
      });

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, [pinnedLayout, reduced]);

  const goToContact = () => scrollToId('#contact');
  const selectService = (index: number) => {
    rootRef.current?.dispatchEvent(
      new CustomEvent<number>(SERVICE_SELECT_EVENT, { detail: index }),
    );
  };

  return (
    <section
      ref={rootRef}
      id="services"
      className="services-system section--navy"
      aria-labelledby="services-heading"
    >
      <div className="services-system__stage">
        <PieceLayer layer="back" />

        <div className="services-assembly__rail" aria-hidden="true">
          <span className="services-assembly__rail-base" />
          <span className="services-assembly__rail-progress" />
        </div>

        <div className="container services-system__layout">
          <div className="services-system__intro">
            <p className="eyebrow t-label services-system__eyebrow">What we do</p>

            <h2 id="services-heading" className="services-system__headline t-display">
              <span className="services-system__line-mask">
                <span className="services-system__headline-line">One system.</span>
              </span>
              <span className="services-system__line-mask">
                <em className="services-system__headline-line t-accent t-italic">
                  Four disciplines.
                </em>
              </span>
            </h2>

            <div className="services-system__source-row">
              <Logo variant="icon" className="services-assembly__mark" title="" />

              <div
                className="services-system__descriptions"
                aria-live="polite"
                aria-atomic="false"
              >
                {SERVICE_CATEGORIES.map((category, index) => (
                  <p
                    key={category.id}
                    id={`${category.id}-description`}
                    className="services-system__description"
                    aria-hidden={!reduced && index !== 0}
                  >
                    {category.description}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="services-system__navigation" aria-label="Four connected disciplines">
            <div className="services-system__signal" aria-hidden="true">
              <span className="services-system__signal-base" />
              <span className="services-system__signal-line" />
              <span className="services-system__signal-node" />
              <span className="services-system__connector" />
            </div>

            <ol className="services-system__items">
              {SERVICE_CATEGORIES.map((category, index) => (
                <li key={category.id} className="services-system__list-item">
                  <button
                    id={category.id}
                    type="button"
                    className={`services-system__item${index === 0 ? ' is-active' : ''}`}
                    aria-current={index === 0 ? 'true' : undefined}
                    onClick={() => selectService(index)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      selectService(index);
                    }}
                    data-cursor="Explore"
                  >
                    <span className="services-system__service-node" aria-hidden="true" />
                    <span className="services-system__index t-display" aria-hidden="true">
                      {category.index}
                    </span>
                    <span className="services-system__name t-display">
                      {serviceName(category.title)}
                    </span>
                    <span className="services-system__arrow" aria-hidden="true">-&gt;</span>
                    <span className="services-system__mobile-description">
                      {category.description}
                    </span>
                    <span className="services-system__underline" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="services-system__final">
            <p className="services-system__final-statement t-display">
              <span>One partner.</span>
              <span>Every discipline connected.</span>
            </p>
            <button
              type="button"
              className="btn services-system__cta"
              onClick={goToContact}
              data-cursor="Build"
            >
              Build your system <span aria-hidden="true">-&gt;</span>
            </button>
          </div>
        </div>

        <PieceLayer layer="front" />
      </div>
    </section>
  );
}
