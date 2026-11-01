import { useEffect, useRef } from 'react';

/** Attach the returned ref to a sentinel element; calls fetchNext when it nears the viewport. */
export function useLoadMore(hasNext: boolean | undefined, fetching: boolean, fetchNext: () => unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && hasNext && !fetching) fetchNext();
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, fetching, fetchNext]);
  return ref;
}
