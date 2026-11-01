import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MovieRail from '@/components/MovieRail';
import MovieCard from '@/components/MovieCard';
import PersonCard from '@/components/PersonCard';
import { RailSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useGenres } from '@/hooks/useGenres';
import { moreApi, tvToMovie } from '@/services/tmdbExtra';

export default function More() {
  const movies = useQuery({ queryKey: ['more', 'movies'], queryFn: moreApi.trendingMoviesToday });
  const tv = useQuery({ queryKey: ['more', 'tv'], queryFn: moreApi.trendingTvToday });
  const people = useQuery({ queryKey: ['more', 'people'], queryFn: moreApi.trendingPeopleToday });
  const movieGenres = useGenres();
  const tvGenres = useQuery({ queryKey: ['tv-genres'], queryFn: moreApi.tvGenres, staleTime: Infinity });

  return (
    <div className="pb-10 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <h1 className="text-4xl font-extrabold">More from movie.db</h1>
        <p className="mt-2 max-w-xl text-fg/70">What’s trending today across movies, TV and people, plus every genre in one place.</p>
      </div>

      <div className="mt-6">
        {movies.isLoading ? <RailSkeleton /> : movies.isError ? <ErrorState onRetry={() => movies.refetch()} /> : <MovieRail title="Trending movies today" movies={movies.data?.results ?? []} />}
      </div>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8" aria-label="Trending TV shows today">
        <h2 className="mb-4 text-2xl font-bold">Trending TV shows today</h2>
        {tv.isError ? <ErrorState onRetry={() => tv.refetch()} /> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {(tv.data?.results ?? []).slice(0, 12).map((s) => <MovieCard key={s.id} movie={tvToMovie(s)} to={`/tv/${s.id}`} />)}
          </div>
        )}
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-8" aria-label="Trending people today">
        <h2 className="mb-4 text-2xl font-bold">Trending people today</h2>
        {people.isError ? <ErrorState onRetry={() => people.refetch()} /> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {(people.data?.results ?? []).slice(0, 12).map((p) => <PersonCard key={p.id} person={p} />)}
          </div>
        )}
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-10 px-4 sm:px-8 md:grid-cols-2" aria-label="Genres">
        {[
          { title: 'Movie genres', base: '/browse', list: movieGenres.data },
          { title: 'TV genres', base: '/tv', list: tvGenres.data },
        ].map((g) => (
          <div key={g.title}>
            <h2 className="mb-4 text-2xl font-bold">{g.title}</h2>
            <div className="flex flex-wrap gap-2">
              {(g.list ?? []).map((x) => (
                <Link key={x.id} to={`${g.base}?genre=${x.id}`} className="rounded-full border border-fg/20 px-4 py-1.5 text-sm font-medium hover:border-accent hover:text-accent">{x.name}</Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
