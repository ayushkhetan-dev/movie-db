import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import MovieDetailPage from './pages/MovieDetail';
import Search from './pages/Search';
import Auth from './pages/Auth';
import Placeholder from './pages/Placeholder';
import Tv from './pages/Tv';
import TvDetailPage from './pages/TvDetail';
import People from './pages/People';
import PersonDetailPage from './pages/PersonDetail';
import More from './pages/More';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="movie/:id" element={<MovieDetailPage />} />
        <Route path="tv" element={<Tv />} />
        <Route path="tv/:id" element={<TvDetailPage />} />
        <Route path="people" element={<People />} />
        <Route path="person/:id" element={<PersonDetailPage />} />
        <Route path="more" element={<More />} />
        <Route path="search" element={<Search />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="signup" element={<Auth mode="signup" />} />
        <Route path="*" element={<Placeholder title="Page not found" notFound />} />
      </Route>
    </Routes>
  );
}
