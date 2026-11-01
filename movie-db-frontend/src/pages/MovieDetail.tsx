import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Star, User } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import ScoreRing from '@/components/ScoreRing';
import TrailerPlayer from '@/components/TrailerPlayer';
import ErrorState from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { api, img, year } from '@/services/tmdb';
import { pickTrailerKey } from '@/services/tmdbExtra';

export default function MovieDetailPage() {
  const { id = '' } = useParams();
  const { hash } = useLocation();
  const { data: m, isLoading, isError, refetch } = useQuery({ queryKey: ['movie', id], queryFn: () => api.detail(id) });

  useEffect(() => {
    if (m && hash === '#trailer') document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [m, hash]);

  if (isError) return <div className="pt-32"><ErrorState onRetry={() => refetch()} /></div>;
  if (isLoading || !m) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Skeleton className="aspect-[2/3] w-64 shrink-0" />
          <div className="flex-1 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-32 w-full" /></div>
        </div>
      </div>
    );
  }

  const trailerKey = pickTrailerKey(m.videos.results);
  const cast = m.credits.cast.slice(0, 16);
  const similar = m.similar.results.slice(0, 12);
  const poster = img(m.poster_path, 'w500');
  const backdrop = img(m.backdrop_path, 'w1280');

  return (
    <>
      <section className="relative overflow-hidden pt-28">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/60" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 sm:px-8 md:flex-row">
          {poster && <img src={poster} alt={`${m.title} poster`} className="w-64 shrink-0 self-start rounded-2xl border border-fg/10 shadow-2xl" />}
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              {m.title} <span className="font-medium text-fg/50">({year(m.release_date)})</span>
            </h1>
            {m.tagline && <p className="mt-2 italic text-fg/70">{m.tagline}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <ScoreRing value={m.vote_average} size={52} />
              <span className="flex items-center gap-1 text-fg/80"><Star className="h-4 w-4 text-accent" />{m.vote_count.toLocaleString()} votes</span>
              {m.runtime ? <span className="flex items-center gap-1 text-fg/80"><Clock className="h-4 w-4 text-accent" />{Math.floor(m.runtime / 60)}h {m.runtime % 60}m</span> : null}
              <span className="rounded-full border border-fg/20 px-3 py-0.5">{m.status}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {m.genres.map((g) => <Link key={g.id} to="/browse" className="rounded-full border border-fg/20 px-3 py-1 text-sm hover:border-accent">{g.name}</Link>)}
            </div>
            <h2 className="mt-8 text-xl font-bold">Overview</h2>
            <p className="mt-2 leading-relaxed text-fg/85">{m.overview || 'No overview available yet.'}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-8">
        <section id="trailer" aria-label="Trailer" className="scroll-mt-28">
          <h2 className="mb-4 text-2xl font-bold">Trailer</h2>
          <TrailerPlayer videoKey={trailerKey} title={m.title} year={year(m.release_date)} autoplay={hash === '#trailer'} />
        </section>

        {cast.length > 0 && (
          <section aria-label="Cast">
            <h2 className="mb-4 text-2xl font-bold">Top cast</h2>
            <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {cast.map((c) => (
                <li key={c.id} className="w-32 shrink-0">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-fg/10 bg-surface">
                    {c.profile_path ? <img src={img(c.profile_path, 'w185') ?? ''} alt={c.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-fg/30"><User className="h-8 w-8" /></div>}
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm font-semibold">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-fg/60">{c.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {similar.length > 0 && (
          <section aria-label="Similar movies">
            <h2 className="mb-4 text-2xl font-bold">Similar movies</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {similar.map((s) => <MovieCard key={s.id} movie={s} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
