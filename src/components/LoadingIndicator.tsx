type LoadingIndicatorProps = {
  message?: string;
};

export const LoadingIndicator = ({ message = 'Loading items...' }: LoadingIndicatorProps) => (
  <div
    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-base text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    role="status"
    aria-live="polite"
  >
    <span
      className="h-5 w-5 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400"
      aria-hidden="true"
    />
    <span>{message}</span>
  </div>
);
