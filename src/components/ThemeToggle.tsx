import type { Theme } from '../context/theme-context';
import { useTheme } from '../hooks/useTheme';

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset
      className="flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Theme selection"
    >
      <legend className="sr-only">Theme</legend>
      {themeOptions.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <input
            type="radio"
            name="theme"
            value={option.value}
            checked={theme === option.value}
            onChange={() => setTheme(option.value)}
            className="accent-blue-600"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
};
