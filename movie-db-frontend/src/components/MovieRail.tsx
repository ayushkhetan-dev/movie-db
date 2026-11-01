import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import MovieCard from './MovieCard';
import { useGenres } from '@/hooks/useGenres';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';
import { year } from '@/services/tmdb';
import type { Movie } from '@/types/tmdb';

const PANEL_W = 300;
const SPEED = 0.04; // px per ms

interface Active { movie: Movie; rect: DOMRect }

export default function MovieRail({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const holdUntil = useRef(0);
  const closeTimer = useRef<number>();
  const [active, setActive] = useState<Active | null>(null);
  const { data: genres } = useGenres();
  const reduced = usePrefersReducedMotion();

  const loop = movies.length >= 7 && !reduced;
  const items = movies.length >= 7 ? [...movies, ...movies] : movies;

  useEffect(() => { paused.current = active !== null; }, [active]);

  // continuous side-scroll
  useEffect(() => {
    const el = ref.current;
    if (!el || !loop) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    const tick = (t: number) => {
      const dt = Math.min(t - last, 64);
      last = t;
      if (paused.current || t < holdUntil.current) {
        pos = el.scrollLeft;
      } else {
        pos += dt * SPEED;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop, movies]);

  // close the panel if the page scrolls (it is positioned against the viewport)
  useEffect(() => {
    if (!active) return;
    const close = () => setActive(null);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [active]);

  const open = useCallback((movie: Movie, e: MouseEvent<HTMLElement>) => {
    window.clearTimeout(closeTimer.current);
    setActive({ movie, rect: e.currentTarget.getBoundingClientRect() });
  }, []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActive(null), 140);
  }, []);
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const nudge = (dir: 1 | -1) => {
    holdUntil.current = performance.now() + 1000;
    ref.current?.scrollBy({ left: dir * 640, behavior: 'smooth' });
  };

  const genreNames = (ids?: number[]) =>
    (ids ?? []).map((id) => genres?.find((g) => g.id === id)?.name).filter(Boolean).slice(0, 3) as string[];

  // place panel right of the card, flip left if it would overflow
  const placement = (r: DOMRect) => {
    const fitsRight = r.right + PANEL_W + 24 < window.innerWidth;
    const left = fitsRight ? r.right + 14 : Math.max(8, r.left - PANEL_W - 14);
    const top = Math.max(84, Math.min(r.top - 8, window.innerHeight - 340));
    return { left, top, dir: fitsRight ? -1 : 1 };
  };

  return (
    <section aria-label={title} className="py-4">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => nudge(-1)} aria-label={`Scroll ${title} left`} className="grid h-9 w-9 place-items-center rounded-full border border-fg/15 hover:border-accent hover:text-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => nudge(1)} aria-label={`Scroll ${title} right`} className="grid h-9 w-9 place-items-center rounded-full border border-fg/15 hover:border-accent hover:text-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-6 sm:px-8"
        onPointerDown={() => { holdUntil.current = performance.now() + 4000; }}
        onWheel={() => { holdUntil.current = performance.now() + 2500; }}
      >
        {items.map((m, i) => (
          <MovieCard key={`${m.id}-${i}`} movie={m} className="w-40 shrink-0 sm:w-44" onEnter={open} onLeave={scheduleClose} />
        ))}
      </div>

      <AnimatePresence>
        {active && (() => {
          const p = placement(active.rect);
          const m = active.movie;
          return (
            <motion.aside
              key={m.id}
              initial={{ opacity: 0, x: p.dir * -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              style={{ position: 'fixed', left: p.left, top: p.top, width: PANEL_W }}
              className="z-40 rounded-2xl border border-fg/10 bg-bg/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
              aria-label={`${m.title} summary`}
            >
              <h3 className="font-display text-lg font-bold leading-tight">{m.title}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-fg/70">
                <span>{year(m.release_date)}</span>
                <span className="flex items-center gap-1 font-semibold text-accent">
                  <Star className="h-3.5 w-3.5 fill-current" />{m.vote_average.toFixed(1)}
                </span>
                <span>{m.vote_count.toLocaleString()} votes</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {genreNames(m.genre_ids).map((g) => (
                  <span key={g} className="rounded-full border border-fg/15 px-2.5 py-0.5 text-xs">{g}</span>
                ))}
              </div>
              <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-fg/80">{m.overview || 'No overview available yet.'}</p>
              <div className="mt-4 flex gap-2">
                <Link to={`/movie/${m.id}`} className="flex-1 rounded-full bg-accent py-2 text-center text-sm font-semibold text-onaccent hover:opacity-90">Details</Link>
                <Link to={`/movie/${m.id}#trailer`} className="flex items-center gap-1.5 rounded-full border border-fg/20 px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
                  <Play className="h-3.5 w-3.5" />Trailer
                </Link>
              </div>
            </motion.aside>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
