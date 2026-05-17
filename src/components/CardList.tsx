import type { Product } from '../types';
import { Card } from './Card';

type CardListProps = {
  items: Product[];
  selectedId?: number | null;
  onSelectItem?: (id: number) => void;
};

export const CardList = ({ items, selectedId = null, onSelectItem }: CardListProps) => {
  if (!items.length) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        No items found for this query.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onSelect={onSelectItem}
        />
      ))}
    </div>
  );
};
