export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}
export interface Genre { id: number; name: string }
export interface Cast { id: number; name: string; character: string; profile_path: string | null }
export interface Video { key: string; site: string; type: string; name: string }
export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  status: string;
  credits: { cast: Cast[] };
  videos: { results: Video[] };
  similar: { results: Movie[] };
}
export interface Paged<T> { results: T[]; page: number; total_pages: number; total_results: number }

/* ---- TV & people ---- */
export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}
export interface TvDetail extends Omit<TvShow, 'genre_ids'> {
  genres: Genre[];
  tagline: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  credits: { cast: Cast[] };
  videos: { results: Video[] };
  similar: { results: TvShow[] };
}
export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for?: { title?: string; name?: string }[];
}
export interface CreditItem {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}
export interface PersonDetail extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  combined_credits: { cast: CreditItem[] };
}

/* ---- multi search ---- */
export interface MultiResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  popularity: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  known_for_department?: string;
  known_for?: { title?: string; name?: string }[];
}
