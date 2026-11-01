import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2l12 7v14l-12 7L4 23V9z" className="fill-accent" />
      <path d="M13 11l8 5-8 5z" className="fill-onaccent" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md" aria-label="movie.db home">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">
        movie<span className="text-accent">.db</span>
      </span>
    </Link>
  );
}
