import { Link } from 'react-router-dom';
import { Main } from '../components/Main';

export const NotFoundPage = () => (
  <Main>
    <section
      className="rounded-xl border border-slate-300 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Page not found"
    >
      <h2 className="mb-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">404</h2>
      <p className="mb-5 text-slate-700 dark:text-slate-300">
        The page you are looking for was not found.
      </p>
      <Link
        className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-base font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400"
        to="/?page=1"
      >
        Back to Home
      </Link>
    </section>
  </Main>
);
