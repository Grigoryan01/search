import type { KeyboardEvent, MouseEvent } from 'react';
import type { Product } from '../types';

type CardProps = {
  item: Product;
  isChecked?: boolean;
  isDetailsActive?: boolean;
  onToggleCheck?: (item: Product) => void;
  onOpenDetails?: (id: number) => void;
};

export const Card = ({
  item,
  isChecked = false,
  isDetailsActive = false,
  onToggleCheck,
  onOpenDetails,
}: CardProps) => {
  const handleOpenDetails = () => {
    onOpenDetails?.(item.id);
  };

  const handleCheckboxChange = () => {
    onToggleCheck?.(item);
  };

  const stopCheckboxPropagation = (event: MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenDetails?.(item.id);
    }
  };

  return (
    <article
      className={`flex gap-3 rounded-xl border bg-slate-50 p-4 shadow-sm transition dark:bg-slate-900 ${
        isDetailsActive
          ? 'border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-500/30'
          : 'border-slate-200 dark:border-slate-700'
      } ${isChecked ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''}`}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
        checked={isChecked}
        onChange={handleCheckboxChange}
        onClick={stopCheckboxPropagation}
        aria-label={`Select ${item.title}`}
      />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={handleOpenDetails}
        onKeyDown={handleContentKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${item.title}`}
      >
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
        <p className="m-0 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>
      </div>
    </article>
  );
};
