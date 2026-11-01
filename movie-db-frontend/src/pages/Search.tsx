import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import MovieCard from '@/components/MovieCard';
import PersonCard from '@/components/PersonCard';
import { GridSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { moreApi, multiLink, multiToMovie, multiToPerson } from '@/services/tmdbExtra';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV shows' },
  { id: 'person', label: 'People' },
] as const;

export default function Search() {
  const [params] = useSearchParams();
  const term = params.get('q')?.trim() ?? '';
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all');

  const q = useInfiniteQuery({
    queryKey: ['search-multi', term],
    queryFn: ({ pageParam }) => moreApi.searchMulti(term, pageParam),
    initialPageParam: 1,
    getNextPageParam: (l) => (l.page < l.total_pages ? l.page + 1 : undefined),
    enabled: term.length > 0,
  });

  const all = (q.data?.pages.flatMap((p) => p.results) ?? []).filter((r) => r.media_type in { movie: 1, tv: 1, person: 1 });
  const shown = tab === 'all' ? all : all.filter((r) => r.media_type === tab);
  const count = (id: string) => (id === 'all' ? all.length : all.filter((r) => r.media_type === id).length);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{term ? `Results for “${term}”` : 'Search'}</h1>
      {!term && <p className="mt-3 text-fg/70">Type a movie, TV show or person in the search bar.</p>}

      {term && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Result type">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${tab === t.id ? 'border-accent bg-accent text-onaccent' : 'border-fg/20 hover:border-accent'}`}
            >
              {t.label} <span className="opacity-70">{count(t.id)}</span>
            </button>
          ))}
        </div>
      )}

      {q.isError && <div className="mt-8"><ErrorState onRetry={() => q.refetch()} /></div>}
      {term && !q.isError && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((r) =>
            r.media_type === 'person'
              ? <PersonCard key={`p-${r.id}`} person={multiToPerson(r)} />
              : <MovieCard key={`${r.media_type}-${r.id}`} movie={multiToMovie(r)} to={multiLink(r)} />,
          )}
          {q.isFetching && <GridSkeleton count={q.isLoading ? 12 : 6} />}
        </div>
      )}
      {term && !q.isLoading && !q.isError && shown.length === 0 && (
        <p className="mt-10 text-fg/70">
          {all.length === 0 ? `Nothing matches “${term}”. Check the spelling or try a shorter keyword.` : 'No results of this type yet. Choose All or load more results.'}
        </p>
      )}
      {q.hasNextPage && (
        <button onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage} className="mx-auto mt-10 block rounded-full bg-accent px-6 py-2.5 font-semibold text-onaccent disabled:opacity-60">
          Load more
        </button>
      )}
    </div>
  );
}
