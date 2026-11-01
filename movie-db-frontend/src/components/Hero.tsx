import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Play, Star } from 'lucide-react';
import { img, year } from '@/services/tmdb';
import type { Movie } from '@/types/tmdb';
import { Skeleton } from './Skeleton';

export default function Hero({ movies, loading }: { movies?: Movie[]; loading: boolean }) {
  const slides = (movies ?? []).filter((m) => m.backdrop_path).slice(0, 6);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % slides.length), 8000);
    return () => window.clearInterval(t);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <div className="relative h-[78vh] min-h-[520px]"><Skeleton className="h-full w-full rounded-none" /></div>;
  }
  const m = slides[i % slides.length];

  return (
    <section aria-label="Trending now" className="relative h-[78vh] min-h-[520px] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={m.id}
          src={img(m.backdrop_path, 'w1280') ?? ''}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-24 sm:px-8">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-bg/60 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
            <Star className="h-3 w-3 fill-current" /> Trending this week
          </p>
          <AnimatePresence mode="wait">
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">{m.title}</h1>
              <p className="mt-3 text-sm text-fg/70">{year(m.release_date)} · {m.vote_average.toFixed(1)} / 10</p>
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-fg/85">{m.overview}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={`/movie/${m.id}#trailer`} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-onaccent hover:opacity-90">
              <Play className="h-4 w-4 fill-current" /> Watch trailer
            </Link>
            <Link to={`/movie/${m.id}`} className="inline-flex items-center gap-2 rounded-full border border-fg/25 bg-bg/50 px-6 py-3 font-semibold backdrop-blur hover:border-accent">
              <Info className="h-4 w-4" /> More info
            </Link>
          </div>
          <div className="mt-8 flex gap-2" role="tablist" aria-label="Choose featured movie">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={idx === i}
                aria-label={`Show ${s.title}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-10 bg-accent' : 'w-4 bg-fg/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
