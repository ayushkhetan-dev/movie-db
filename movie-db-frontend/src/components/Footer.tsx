import { Link } from 'react-router-dom';
import { Github, Instagram, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo';

const cols = [
  { title: 'Navigation', items: [['Home', '/'], ['Movies', '/browse'], ['TV Shows', '/tv'], ['People', '/people']] },
  { title: 'Community', items: [['Log in', '/login'], ['Sign up', '/signup'], ['Guidelines', '/more'], ['Discussions', '/more']] },
  { title: 'Legal', items: [['Terms of use', '/more'], ['Privacy policy', '/more'], ['API terms', '/more'], ['Contact', '/more']] },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-fg/10 bg-surface/80 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-fg/60">A complete inventory of movies. Find what to watch, and what everyone else is watching.</p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
              <a key={i} href="#" aria-label={['Twitter', 'Instagram', 'YouTube', 'GitHub'][i]} className="grid h-9 w-9 place-items-center rounded-full border border-fg/15 hover:border-accent hover:text-accent">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-base font-semibold">{c.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-fg/70">
              {c.items.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-accent">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-fg/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-fg/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} movie.db. All rights reserved.</p>
          <p className="max-w-md sm:text-right">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>
    </footer>
  );
}
