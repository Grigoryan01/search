import { useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RefreshButton } from '../components/RefreshButton';
import { useProductDetailsQuery } from '../hooks/useProductDetailsQuery';
import { productKeys } from '../lib/queryKeys';

type DetailsOutletContext = {
  onClose: () => void;
};

type DetailsPanelContentProps = {
  detailsId: string;
};

const DETAILS_ERROR_MESSAGE = 'Unable to load item details. Please try again.';

const DetailsPanelContent = ({ detailsId }: DetailsPanelContentProps) => {
  const queryClient = useQueryClient();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const numericId = Number(detailsId);
  const isInvalidId = Number.isNaN(numericId);

  const {
    data: product,
    isPending,
    isError,
    isFetching,
    isRefetching,
  } = useProductDetailsQuery(numericId, !isInvalidId);

  const isLoading = isPending || (isRefetching && !product);
  const errorMessage = isError ? DETAILS_ERROR_MESSAGE : '';

  const handleRefreshDetails = () => {
    if (isInvalidId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: productKeys.detail(numericId),
    });
  };

  return (
    <aside
      className="h-full min-h-[420px] rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Item details"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">Item Details</h2>
        <div className="flex gap-2">
          {!isInvalidId && (
            <RefreshButton
              onRefresh={handleRefreshDetails}
              isRefreshing={isFetching && !isPending}
              label="Refresh details"
            />
          )}
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={onClose}
            aria-label="Close details panel"
          >
            Close
          </button>
        </div>
      </div>

      {isInvalidId && <ErrorMessage message="Invalid item selected." />}

      {!isInvalidId && isLoading && <LoadingIndicator message="Loading details..." />}

      {!isInvalidId && !isLoading && errorMessage && <ErrorMessage message={errorMessage} />}

      {!isInvalidId && !isLoading && !errorMessage && product && (
        <article>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {product.title}
          </h3>
          <p className="m-0 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {product.description}
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">ID: {product.id}</p>
        </article>
      )}
    </aside>
  );
};

export const DetailsPanel = () => {
  const [searchParams] = useSearchParams();
  const detailsId = searchParams.get('details');

  if (!detailsId) {
    return null;
  }

  return <DetailsPanelContent key={detailsId} detailsId={detailsId} />;
};
