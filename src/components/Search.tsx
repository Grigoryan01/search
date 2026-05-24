import type { ChangeEvent } from 'react';

type SearchProps = {
  value: string;
  onValueChange: (nextValue: string) => void;
  onSearch: () => void;
};

export const Search = ({ value, onValueChange, onSearch }: SearchProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
      <input
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-500/30"
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Search products"
        aria-label="Search products"
      />
      <button
        className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-base font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-500/50"
        type="button"
        onClick={onSearch}
      >
        Search
      </button>
    </div>
  );
};
