import { useEffect } from 'react';

/** Keeps the page from scrolling behind a modal while `locked` is true. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [locked]);
}
