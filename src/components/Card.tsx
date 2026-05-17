import type { KeyboardEvent } from 'react';
import type { Product } from '../types';

type CardProps = {
  item: Product;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
};

export const Card = ({ item, isSelected = false, onSelect }: CardProps) => {
  const handleClick = () => {
    onSelect?.(item.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(item.id);
    }
  };

  return (
    <article
      className={`cursor-pointer rounded-xl border bg-slate-50 p-4 shadow-sm transition dark:bg-slate-900 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-500/30'
          : 'border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-600'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`View details for ${item.title}`}
    >
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
      <p className="m-0 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>
    </article>
  );
};
