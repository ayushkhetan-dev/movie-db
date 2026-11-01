import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import ErrorState from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { img } from '@/services/tmdb';
import { creditToMovie, moreApi } from '@/services/tmdbExtra';

export default function PersonDetailPage() {
  const { id = '' } = useParams();
  const [full, setFull] = useState(false);
  const { data: p, isLoading, isError, refetch } = useQuery({ queryKey: ['person', id], queryFn: () => moreApi.person(id) });

  if (isError) return <div className="pt-32"><ErrorState onRetry={() => refetch()} /></div>;
  if (isLoading || !p) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-32 sm:px-8 md:flex-row">
        <Skeleton className="aspect-[2/3] w-64 shrink-0" />
        <div className="flex-1 space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /></div>
      </div>
    );
  }
  const photo = img(p.profile_path, 'w500');
  const seen = new Set<string>();
  const known = [...p.combined_credits.cast]
    .sort((a, b) => b.popularity - a.popularity)
    .filter((c) => { const k = `${c.media_type}-${c.id}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 12);
  const bio = p.biography || 'No biography is available yet.';
  const long = bio.length > 700;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-64 shrink-0">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-fg/10 bg-surface shadow-2xl">
            {photo ? <img src={photo} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-fg/30"><User className="h-14 w-14" /></div>}
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div><dt className="font-semibold">Known for</dt><dd className="text-fg/70">{p.known_for_department}</dd></div>
            {p.birthday && <div><dt className="font-semibold">Born</dt><dd className="text-fg/70">{p.birthday}</dd></div>}
            {p.deathday && <div><dt className="font-semibold">Died</dt><dd className="text-fg/70">{p.deathday}</dd></div>}
            {p.place_of_birth && <div><dt className="font-semibold">Place of birth</dt><dd className="text-fg/70">{p.place_of_birth}</dd></div>}
          </dl>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{p.name}</h1>
          <h2 className="mt-6 text-xl font-bold">Biography</h2>
          <p className="mt-2 max-w-3xl whitespace-pre-line leading-relaxed text-fg/85">{long && !full ? `${bio.slice(0, 700)}…` : bio}</p>
          {long && <button onClick={() => setFull(!full)} className="mt-2 text-sm font-semibold text-accent hover:underline">{full ? 'Show less' : 'Read more'}</button>}
          {known.length > 0 && (
            <>
              <h2 className="mb-4 mt-10 text-2xl font-bold">Known for</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {known.map((c) => <MovieCard key={`${c.media_type}-${c.id}`} movie={creditToMovie(c)} to={`/${c.media_type === 'tv' ? 'tv' : 'movie'}/${c.id}`} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
