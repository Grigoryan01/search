import { NavLink, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';
import { ThemeToggle } from './ThemeToggle';

type AppLayoutProps = {
  onTriggerError: () => void;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-blue-600 text-white dark:bg-blue-500'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
  }`;

export const AppLayout = ({ onTriggerError }: AppLayoutProps) => (
  <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col p-4 sm:p-6">
    <Header title="Product Search" />
    <div className="mb-5 flex justify-center">
      <ThemeToggle />
    </div>
    <nav
      className="mb-5 flex justify-center gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Main navigation"
    >
      <NavLink to="/" className={navLinkClass}>
        Home
      </NavLink>
      <NavLink to="/about" className={navLinkClass}>
        About
      </NavLink>
    </nav>
    <div className="flex-1">
      <Outlet />
    </div>
    <SelectedItemsFlyout />
    <footer className="mt-3 flex justify-end">
      <button
        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-500/50"
        type="button"
        onClick={onTriggerError}
      >
        Trigger Error
      </button>
    </footer>
  </div>
);
