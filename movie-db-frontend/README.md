# movie.db — frontend

React 18 + TypeScript + Vite + Tailwind CSS. Data from the TMDB API.

## Run
```bash
npm install
cp .env.example .env   # add VITE_TMDB_TOKEN (preferred) or VITE_TMDB_API_KEY
npm run dev
```
`npm run build` type-checks and creates a production bundle in `dist/`.

## Structure
- `src/components` – Navbar, Footer, Hero, MovieRail (auto-scroll + hover panel), MovieCard, skeletons
- `src/pages` – Home, Browse, MovieDetail, Search, Auth (login/signup), Placeholder
- `src/services/tmdb.ts` – typed TMDB client (swap for the FastAPI proxy later)
- `src/context/ThemeContext.tsx` – light/dark theme, persisted
- Theme tokens live in `src/styles/index.css`; accents `#91FF16` (dark) and `#006B54` (light).

## Next (backend)
FastAPI will proxy TMDB (keeps the key off the browser) and MongoDB will store users; point `services/tmdb.ts` at it and wire `pages/Auth.tsx`.
