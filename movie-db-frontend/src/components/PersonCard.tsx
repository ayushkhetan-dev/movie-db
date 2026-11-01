import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { img } from '@/services/tmdb';
import type { Person } from '@/types/tmdb';

export default function PersonCard({ person }: { person: Person }) {
  const src = img(person.profile_path, 'w342');
  const known = (person.known_for ?? []).map((k) => k.title ?? k.name).filter(Boolean).slice(0, 2).join(', ');
  return (
    <Link to={`/person/${person.id}`} className="group block rounded-xl transition-transform duration-300 hover:scale-[1.04]">
      <div className="aspect-[2/3] overflow-hidden rounded-xl border border-fg/10 bg-surface shadow-md">
        {src ? <img src={src} alt={person.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-fg/30"><User className="h-10 w-10" /></div>}
      </div>
      <h3 className="mt-3 line-clamp-1 text-sm font-semibold">{person.name}</h3>
      <p className="line-clamp-1 text-xs text-fg/60">{known || person.known_for_department}</p>
    </Link>
  );
}
