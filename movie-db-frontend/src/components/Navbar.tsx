import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import Logo from './Logo';
import SearchBox from './SearchBox';
import { useTheme } from '@/context/ThemeContext';

const links = [
  { to: '/browse', label: 'Movies' },
  { to: '/tv', label: 'TV Shows' },
  { to: '/people', label: 'People' },
  { to: '/more', label: 'More' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-fg/10 text-accent' : 'text-fg/80 hover:text-fg'}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        aria-label="Primary"
        className={`w-full border border-fg/10 bg-bg/70 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? 'max-w-5xl rounded-full px-3 py-1.5' : 'max-w-7xl rounded-2xl px-4 py-2.5'
        }`}
      >
        <div className="flex items-center gap-3">
          <Logo />
          <div className="ml-4 hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkCls}>{l.label}</NavLink>
            ))}
          </div>
          <SearchBox className="ml-auto hidden w-64 md:block" />
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-fg/10 md:ml-0"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/login" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-fg/10">Log in</Link>
            <Link to="/signup" className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-onaccent hover:opacity-90">Sign up</Link>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-fg/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-1 pb-3 pt-4">
                <SearchBox inline className="mb-2 md:hidden" onDone={() => setOpen(false)} />
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkCls}>{l.label}</NavLink>
                ))}
                <div className="mt-2 flex gap-2 sm:hidden">
                  <Link to="/login" className="flex-1 rounded-full border border-fg/20 py-2 text-center text-sm font-medium">Log in</Link>
                  <Link to="/signup" className="flex-1 rounded-full bg-accent py-2 text-center text-sm font-semibold text-onaccent">Sign up</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
