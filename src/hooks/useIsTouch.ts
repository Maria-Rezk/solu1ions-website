import { useSyncExternalStore } from 'react';

const QUERY = '(hover: none), (pointer: coarse)';

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

/** True on touch-first devices — disables cursor/magnetic effects. */
export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
}
