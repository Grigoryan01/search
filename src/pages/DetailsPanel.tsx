import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { fetchProductById } from '../api';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import type { Product } from '../types';

type DetailsOutletContext = {
  onClose: () => void;
};

export const DetailsPanel = () => {
  const [searchParams] = useSearchParams();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const detailsId = searchParams.get('details');

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!detailsId) {
      setProduct(null);
      setErrorMessage('');
      return;
    }

    const id = Number(detailsId);
    if (Number.isNaN(id)) {
      setProduct(null);
      setErrorMessage('Invalid item selected.');
      return;
    }

    const loadDetails = async () => {
      setIsLoading(true);
      setErrorMessage('');
      setProduct(null);

      try {
        const item = await fetchProductById(id);
        setProduct(item);
      } catch {
        setErrorMessage('Unable to load item details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetails();
  }, [detailsId]);

  if (!detailsId) {
    return null;
  }

  return (
    <aside
      className="h-full min-h-[420px] rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Item details"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">Item Details</h2>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={onClose}
          aria-label="Close details panel"
        >
          Close
        </button>
      </div>

      {isLoading && <LoadingIndicator message="Loading details..." />}

      {!isLoading && errorMessage && <ErrorMessage message={errorMessage} />}

      {!isLoading && !errorMessage && product && (
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
