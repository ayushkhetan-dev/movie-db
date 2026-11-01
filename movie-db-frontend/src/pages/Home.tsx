import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/Hero';
import MovieRail from '@/components/MovieRail';
import { RailSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useGenres } from '@/hooks/useGenres';
import { api } from '@/services/tmdb';
import type { Movie, Paged } from '@/types/tmdb';

const rails: { key: string; title: string; fn: () => Promise<Paged<Movie>> }[] = [
  { key: 'trending', title: 'Trending', fn: api.trending },
  { key: 'popular', title: 'Popular', fn: api.popular },
  { key: 'top', title: 'Top rated', fn: api.topRated },
  { key: 'now', title: 'Now playing', fn: api.nowPlaying },
  { key: 'upcoming', title: 'Upcoming', fn: api.upcoming },
];

function Rail({ title, queryKey, fn, genre }: { title: string; queryKey: string; fn: () => Promise<Paged<Movie>>; genre: number | null }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['rail', queryKey], queryFn: fn });
  if (isLoading) return <div className="py-4"><h2 className="mb-3 px-4 text-2xl font-bold sm:px-8">{title}</h2><RailSkeleton /></div>;
  if (isError) return <div className="py-4"><h2 className="mb-3 px-4 text-2xl font-bold sm:px-8">{title}</h2><ErrorState onRetry={() => refetch()} /></div>;
  const list = (data?.results ?? []).filter((m) => genre === null || m.genre_ids?.includes(genre));
  if (list.length === 0) {
    return (
      <div className="py-4">
        <h2 className="mb-3 px-4 text-2xl font-bold sm:px-8">{title}</h2>
        <p className="px-4 text-sm text-fg/60 sm:px-8">No titles in this row match the selected genre. Pick another genre or choose All.</p>
      </div>
    );
  }
  return <MovieRail title={title} movies={list} />;
}

export default function Home() {
  const [genre, setGenre] = useState<number | null>(null);
  const trending = useQuery({ queryKey: ['rail', 'trending'], queryFn: api.trending });
  const { data: genres } = useGenres();

  return (
    <>
      <Hero movies={trending.data?.results} loading={trending.isLoading} />
      <div className="relative z-10 -mt-10">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 sm:px-8" role="group" aria-label="Filter rows by genre">
          {[{ id: null as number | null, name: 'All' }, ...(genres ?? [])].map((g) => (
            <button
              key={g.name}
              onClick={() => setGenre(g.id)}
              aria-pressed={genre === g.id}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                genre === g.id ? 'border-accent bg-accent text-onaccent' : 'border-fg/20 bg-bg/70 backdrop-blur hover:border-accent'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
        {rails.map((r) => (
          <Rail key={r.key} title={r.title} queryKey={r.key} fn={r.fn} genre={genre} />
        ))}
      </div>
    </>
  );
}
