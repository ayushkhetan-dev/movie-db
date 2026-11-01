import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import ScoreRing from './ScoreRing';
import { img, year } from '@/services/tmdb';
import type { Movie } from '@/types/tmdb';

interface Props {
  movie: Movie;
  className?: string;
  to?: string;
  onEnter?: (movie: Movie, e: MouseEvent<HTMLElement>) => void;
  onLeave?: () => void;
}

export default function MovieCard({ movie, className = '', to, onEnter, onLeave }: Props) {
  const src = img(movie.poster_path, 'w342');
  return (
    <article
      className={`relative ${className}`}
      onMouseEnter={onEnter ? (e) => onEnter(movie, e) : undefined}
      onMouseLeave={onLeave}
    >
      <Link
        to={to ?? `/movie/${movie.id}`}
        className="group block rounded-xl transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.07] focus-visible:scale-[1.07]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-fg/10 bg-surface shadow-md">
          {src ? (
            <img src={src} alt={`${movie.title} poster`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-fg/30"><Film className="h-10 w-10" /></div>
          )}
          <div className="absolute bottom-2 left-2"><ScoreRing value={movie.vote_average} /></div>
        </div>
        <h3 className="mt-3 line-clamp-1 text-sm font-semibold">{movie.title}</h3>
        <p className="text-xs text-fg/60">{year(movie.release_date)}</p>
      </Link>
    </article>
  );
}
