import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import MovieCard from '@/components/MovieCard';
import { GridSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useLoadMore } from '@/hooks/useLoadMore';
import { moreApi, tvToMovie } from '@/services/tmdbExtra';

const sorts = [
  { v: 'popularity.desc', l: 'Most popular' },
  { v: 'vote_average.desc', l: 'Highest rated' },
  { v: 'first_air_date.desc', l: 'Newest' },
];

export default function Tv() {
  const [params] = useSearchParams();
  const [genre, setGenre] = useState<number | null>(Number(params.get('genre')) || null);
  const [sort, setSort] = useState(sorts[0].v);
  const { data: genres } = useQuery({ queryKey: ['tv-genres'], queryFn: moreApi.tvGenres, staleTime: Infinity });

  const q = useInfiniteQuery({
    queryKey: ['discover-tv', genre, sort],
    queryFn: ({ pageParam }) => moreApi.discoverTv({ page: pageParam, genre, sort }),
    initialPageParam: 1,
    getNextPageParam: (l) => (l.page < Math.min(l.total_pages, 500) ? l.page + 1 : undefined),
  });
  const sentinel = useLoadMore(q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage);
  const shows = q.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-8">
      <h1 className="text-4xl font-extrabold">TV shows</h1>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm text-fg/70" htmlFor="tv-sort">Sort by</label>
        <select id="tv-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-fg/20 bg-surface px-4 py-2 text-sm">
          {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by genre">
        {[{ id: null as number | null, name: 'All genres' }, ...(genres ?? [])].map((g) => (
          <button key={g.name} onClick={() => setGenre(g.id)} aria-pressed={genre === g.id}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${genre === g.id ? 'border-accent bg-accent text-onaccent' : 'border-fg/20 hover:border-accent'}`}>
            {g.name}
          </button>
        ))}
      </div>
      {q.isError ? (
        <div className="mt-8"><ErrorState onRetry={() => q.refetch()} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shows.map((s) => <MovieCard key={s.id} movie={tvToMovie(s)} to={`/tv/${s.id}`} />)}
          {(q.isLoading || q.isFetchingNextPage) && <GridSkeleton count={q.isLoading ? 18 : 6} />}
        </div>
      )}
      <div ref={sentinel} className="h-10" />
    </div>
  );
}
