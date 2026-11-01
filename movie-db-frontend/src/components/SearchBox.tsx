import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Film, Search, Star, Tv, User } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { img, year } from '@/services/tmdb';
import { moreApi, multiDate, multiLink, multiTitle } from '@/services/tmdbExtra';
import type { MultiResult } from '@/types/tmdb';

const MAX_OPTIONS = 4;
const typeLabel = { movie: 'Movie', tv: 'TV show', person: 'Person' } as const;
const TypeIcon = { movie: Film, tv: Tv, person: User } as const;

interface Props { className?: string; inline?: boolean; onDone?: () => void }

export default function SearchBox({ className = '', inline = false, onDone }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  const navigate = useNavigate();
  const term = useDebounce(q.trim(), 250);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['suggest', term],
    queryFn: () => moreApi.searchMulti(term),
    enabled: term.length > 0,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 0,
  });

  // most popular first, 4 at most
  const options = useMemo(
    () => (data?.results ?? []).filter((r) => r.media_type in typeLabel).sort((a, b) => b.popularity - a.popularity).slice(0, MAX_OPTIONS),
    [data],
  );

  useEffect(() => setActive(-1), [term]);
  useEffect(() => {
    const away = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const finish = () => { setQ(''); setOpen(false); setActive(-1); onDone?.(); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (active >= 0 && options[active]) { navigate(multiLink(options[active])); return finish(); }
    const v = q.trim();
    if (!v) return;
    navigate(`/search?q=${encodeURIComponent(v)}`);
    finish();
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => (options.length ? (a + 1) % options.length : -1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (options.length ? (a <= 0 ? options.length - 1 : a - 1) : -1)); }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1); }
  };

  const showPanel = open && q.trim().length > 0;
  const settled = term === q.trim() && !isFetching;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form onSubmit={submit} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/50" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search movies, TV shows and people"
          placeholder="Search movies, TV, people"
          className="w-full rounded-full border border-fg/10 bg-fg/5 py-2 pl-9 pr-3 text-sm placeholder:text-fg/50 focus:border-accent focus:outline-none"
        />
      </form>

      {showPanel && (
        <div className={`${inline ? 'mt-2' : 'absolute right-0 top-full mt-2 w-[24rem] max-w-[calc(100vw-2rem)]'} z-50 overflow-hidden rounded-2xl border border-fg/10 bg-bg/95 shadow-2xl shadow-black/30 backdrop-blur-xl`}>
          {options.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Suggestions">
              {options.map((r, i) => (
                <Option key={`${r.media_type}-${r.id}`} r={r} id={`${listId}-${i}`} active={i === active} onHover={() => setActive(i)} onPick={finish} />
              ))}
            </ul>
          ) : (
            <p id={listId} className="px-4 py-3 text-sm text-fg/70" role="status">
              {isError ? 'Search is unavailable right now. Try again in a moment.' : settled ? `No matches for “${q.trim()}”.` : 'Searching…'}
            </p>
          )}
          {options.length > 0 && <p className="border-t border-fg/10 px-4 py-2 text-xs text-fg/60">Press Enter to see all results</p>}
        </div>
      )}
    </div>
  );
}

function Option({ r, id, active, onHover, onPick }: { r: MultiResult; id: string; active: boolean; onHover: () => void; onPick: () => void }) {
  const Icon = TypeIcon[r.media_type];
  const src = img(r.media_type === 'person' ? r.profile_path ?? null : r.poster_path ?? null, 'w185');
  const rating = r.vote_average ?? 0;
  return (
    <li role="option" id={id} aria-selected={active}>
      <Link
        to={multiLink(r)}
        onClick={onPick}
        onMouseEnter={onHover}
        className={`flex items-center gap-3 px-3 py-2.5 ${active ? 'bg-fg/10' : ''}`}
      >
        <div className="grid h-14 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-fg/40">
          {src ? <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{multiTitle(r)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-fg/65">
            <span className="rounded-full border border-fg/20 px-2 py-px">{typeLabel[r.media_type]}</span>
            {r.media_type === 'person' ? (
              <span>{r.known_for_department}</span>
            ) : (
              <>
                <span>{year(multiDate(r))}</span>
                <span className="flex items-center gap-1 font-medium text-accent">
                  <Star className="h-3 w-3 fill-current" />
                  {rating > 0 ? rating.toFixed(1) : 'NR'}
                </span>
              </>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}
