import { Main } from '../components/Main';

export const AboutPage = () => (
  <Main>
    <section
      className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="About the application"
    >
      <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">About</h2>
      <p className="mb-3 text-slate-700 dark:text-slate-300">
        Product Search is a React application built for the RS School React course. It lets you
        browse and search products from the DummyJSON API with pagination and a master-detail
        layout.
      </p>
      <p className="mb-3 text-slate-700 dark:text-slate-300">
        <strong>Author:</strong> RS School Student
      </p>
      <p className="m-0 text-slate-700 dark:text-slate-300">
        Learn more on the{' '}
        <a
          className="font-medium text-blue-600 underline transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          href="https://rs.school/react/"
          target="_blank"
          rel="noreferrer"
        >
          RS School React course
        </a>{' '}
        page.
      </p>
    </section>
  </Main>
);
