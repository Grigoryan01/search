type RefreshButtonProps = {
  onRefresh: () => void;
  isRefreshing?: boolean;
  label?: string;
};

export const RefreshButton = ({
  onRefresh,
  isRefreshing = false,
  label = 'Refresh',
}: RefreshButtonProps) => (
  <button
    type="button"
    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    onClick={onRefresh}
    disabled={isRefreshing}
    aria-label={label}
  >
    {isRefreshing ? 'Refreshing...' : label}
  </button>
);
