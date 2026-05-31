import { useMemo } from 'react';
import { useSelectedItemsStore } from '../store/selectedItemsStore';
import { downloadSelectedItemsAsCsv } from '../utils/downloadCsv';

export const SelectedItemsFlyout = () => {
  const selectedItemsRecord = useSelectedItemsStore((state) => state.selectedItems);
  const clearAll = useSelectedItemsStore((state) => state.clearAll);
  const selectedItems = useMemo(
    () => Object.values(selectedItemsRecord),
    [selectedItemsRecord]
  );
  const selectedCount = selectedItems.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleDownload = () => {
    downloadSelectedItemsAsCsv(selectedItems);
  };

  return (
    <aside
      className="sticky bottom-0 z-50 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-lg dark:border-slate-600 dark:bg-slate-900"
      aria-label="Selected items actions"
      role="region"
    >
      <p className="m-0 text-sm font-medium text-slate-800 dark:text-slate-100">
        {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={clearAll}
        >
          Unselect all
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </aside>
  );
};
