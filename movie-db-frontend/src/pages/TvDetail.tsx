import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Layers, User } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import ScoreRing from '@/components/ScoreRing';
import TrailerPlayer from '@/components/TrailerPlayer';
import ErrorState from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { img, year } from '@/services/tmdb';
import { moreApi, pickTrailerKey, tvToMovie } from '@/services/tmdbExtra';

export default function TvDetailPage() {
  const { id = '' } = useParams();
  const { hash } = useLocation();
  const { data: t, isLoading, isError, refetch } = useQuery({ queryKey: ['tv', id], queryFn: () => moreApi.tvDetail(id) });

  useEffect(() => {
    if (t && hash === '#trailer') document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [t, hash]);

  if (isError) return <div className="pt-32"><ErrorState onRetry={() => refetch()} /></div>;
  if (isLoading || !t) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Skeleton className="aspect-[2/3] w-64 shrink-0" />
          <div className="flex-1 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-32 w-full" /></div>
        </div>
      </div>
    );
  }
  const poster = img(t.poster_path, 'w500');
  const backdrop = img(t.backdrop_path, 'w1280');
  const cast = t.credits.cast.slice(0, 16);
  const similar = t.similar.results.slice(0, 12);
  const runtime = t.episode_run_time[0];

  return (
    <>
      <section className="relative overflow-hidden pt-28">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/60" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 sm:px-8 md:flex-row">
          {poster && <img src={poster} alt={`${t.name} poster`} className="w-64 shrink-0 self-start rounded-2xl border border-fg/10 shadow-2xl" />}
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{t.name} <span className="font-medium text-fg/50">({year(t.first_air_date)})</span></h1>
            {t.tagline && <p className="mt-2 italic text-fg/70">{t.tagline}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <ScoreRing value={t.vote_average} size={52} />
              <span className="flex items-center gap-1 text-fg/80"><Layers className="h-4 w-4 text-accent" />{t.number_of_seasons} seasons · {t.number_of_episodes} episodes</span>
              {runtime ? <span className="flex items-center gap-1 text-fg/80"><Clock className="h-4 w-4 text-accent" />{runtime} min per episode</span> : null}
              <span className="rounded-full border border-fg/20 px-3 py-0.5">{t.status}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.genres.map((g) => <Link key={g.id} to={`/tv?genre=${g.id}`} className="rounded-full border border-fg/20 px-3 py-1 text-sm hover:border-accent">{g.name}</Link>)}
            </div>
            <h2 className="mt-8 text-xl font-bold">Overview</h2>
            <p className="mt-2 leading-relaxed text-fg/85">{t.overview || 'No overview available yet.'}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-8">
        <section id="trailer" aria-label="Trailer" className="scroll-mt-28">
          <h2 className="mb-4 text-2xl font-bold">Trailer</h2>
          <TrailerPlayer videoKey={pickTrailerKey(t.videos.results)} title={t.name} year={year(t.first_air_date)} autoplay={hash === '#trailer'} />
        </section>
        {cast.length > 0 && (
          <section aria-label="Cast">
            <h2 className="mb-4 text-2xl font-bold">Top cast</h2>
            <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {cast.map((c) => (
                <li key={c.id} className="w-32 shrink-0">
                  <Link to={`/person/${c.id}`}>
                    <div className="aspect-[2/3] overflow-hidden rounded-xl border border-fg/10 bg-surface">
                      {c.profile_path ? <img src={img(c.profile_path, 'w185') ?? ''} alt={c.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-fg/30"><User className="h-8 w-8" /></div>}
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-semibold">{c.name}</p>
                    <p className="line-clamp-1 text-xs text-fg/60">{c.character}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {similar.length > 0 && (
          <section aria-label="Similar shows">
            <h2 className="mb-4 text-2xl font-bold">Similar shows</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {similar.map((s) => <MovieCard key={s.id} movie={tvToMovie(s)} to={`/tv/${s.id}`} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
