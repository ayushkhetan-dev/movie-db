import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { LogoMark } from '@/components/Logo';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const signup = mode === 'signup';
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (signup && v.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address, like name@example.com.';
    if (v.password.length < 8) e.password = 'Use at least 8 characters.';
    if (signup && v.confirm !== v.password) e.confirm = 'Passwords don’t match.';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setDone(Object.keys(e).length === 0); // TODO: call the FastAPI auth endpoints once the backend exists
  };

  const field = (key: keyof typeof v, label: string, type: string, auto: string) => (
    <div>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        id={key}
        type={type}
        autoComplete={auto}
        value={v[key]}
        onChange={(e) => setV({ ...v, [key]: e.target.value })}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-err` : undefined}
        className="w-full rounded-xl border border-fg/20 bg-bg/60 px-4 py-2.5 focus:border-accent focus:outline-none aria-[invalid=true]:border-red-500"
      />
      {errors[key] && <p id={`${key}-err`} className="mt-1 text-sm text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-10 pt-32">
      <div className="rounded-3xl border border-fg/10 bg-surface/90 p-8 shadow-2xl shadow-black/10 backdrop-blur">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-4 text-3xl font-extrabold">{signup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-fg/70">{signup ? 'Save favourites and build watchlists.' : 'Log in to see your watchlist.'}</p>

        {done && (
          <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Details look good. Accounts will work once the server is connected.
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {signup && field('name', 'Name', 'text', 'name')}
          {field('email', 'Email', 'email', 'email')}
          {field('password', 'Password', 'password', signup ? 'new-password' : 'current-password')}
          {signup && field('confirm', 'Confirm password', 'password', 'new-password')}
          <button type="submit" className="w-full rounded-full bg-accent py-3 font-semibold text-onaccent hover:opacity-90">
            {signup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-fg/70">
          {signup ? 'Already have an account? ' : 'New to movie.db? '}
          <Link to={signup ? '/login' : '/signup'} className="font-semibold text-accent hover:underline">{signup ? 'Log in' : 'Sign up'}</Link>
        </p>
      </div>
    </div>
  );
}
