import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/Logo';

export default function Placeholder({ title, notFound = false }: { title: string; notFound?: boolean }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 pb-10 pt-40 text-center">
      <LogoMark className="h-14 w-14" />
      <h1 className="mt-6 text-4xl font-extrabold">{title}</h1>
      <p className="mt-3 text-fg/70">
        {notFound ? 'That page doesn’t exist. Head back to the home page to keep browsing.' : 'This section is not available yet. Movies are ready to browse now.'}
      </p>
      <Link to={notFound ? '/' : '/browse'} className="mt-7 rounded-full bg-accent px-6 py-2.5 font-semibold text-onaccent hover:opacity-90">
        {notFound ? 'Go to home' : 'Browse movies'}
      </Link>
    </div>
  );
}
