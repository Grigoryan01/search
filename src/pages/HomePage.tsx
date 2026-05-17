import { useCallback, useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { fetchProducts, PAGE_SIZE } from '../api';
import { CardList } from '../components/CardList';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { Main } from '../components/Main';
import { Pagination } from '../components/Pagination';
import { Search } from '../components/Search';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Product } from '../types';

const SEARCH_STORAGE_KEY = 'searchTerm';

const parsePage = (rawPage: string | null): number => {
  const parsed = Number(rawPage ?? '1');
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
};

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storedValue: persistedSearch, setValue: setPersistedSearch } =
    useLocalStorage(SEARCH_STORAGE_KEY);

  const page = parsePage(searchParams.get('page'));
  const detailsParam = searchParams.get('details');
  const selectedId = detailsParam ? Number(detailsParam) : null;

  const [inputValue, setInputValue] = useState(persistedSearch);
  const [lastSubmittedSearch, setLastSubmittedSearch] = useState(persistedSearch);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void, options?: { replace?: boolean }) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          updater(next);
          if (!next.get('page')) {
            next.set('page', '1');
          }
          return next;
        },
        options
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!searchParams.get('page')) {
      updateSearchParams((params) => {
        params.set('page', '1');
      }, { replace: true });
    }
  }, [searchParams, updateSearchParams]);

  const loadProducts = useCallback(async (searchTerm: string, currentPage: number) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await fetchProducts(searchTerm, currentPage);
      setItems(result.products);
      setTotal(result.total);
    } catch {
      setItems([]);
      setTotal(0);
      setErrorMessage('Unable to load items. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts(lastSubmittedSearch, page);
  }, [lastSubmittedSearch, page, loadProducts]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages && !isLoading && total > 0) {
      updateSearchParams((params) => {
        params.set('page', String(totalPages));
      }, { replace: true });
    }
  }, [page, totalPages, isLoading, total, updateSearchParams]);

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    updateSearchParams((params) => {
      params.set('page', '1');
      params.delete('details');
    });
  };

  const handleSearch = () => {
    const trimmedSearch = inputValue.trim();

    if (trimmedSearch === lastSubmittedSearch) {
      return;
    }

    setPersistedSearch(trimmedSearch);
    setInputValue(trimmedSearch);
    setLastSubmittedSearch(trimmedSearch);
    updateSearchParams((params) => {
      params.set('page', '1');
      params.delete('details');
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams((params) => {
      params.set('page', String(nextPage));
    });
  };

  const handleSelectItem = (id: number) => {
    updateSearchParams((params) => {
      params.set('details', String(id));
    });
  };

  const handleCloseDetails = () => {
    updateSearchParams((params) => {
      params.delete('details');
    });
  };

  const handleMainPanelClick = () => {
    if (detailsParam) {
      handleCloseDetails();
    }
  };

  const showPagination = !isLoading && !errorMessage && items.length > 0;
  const hasDetailsOpen = Boolean(detailsParam);

  const outletContext = { onClose: handleCloseDetails };

  const renderResults = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (errorMessage) {
      return <ErrorMessage message={errorMessage} />;
    }

    return (
      <>
        <CardList
          items={items}
          selectedId={Number.isNaN(selectedId ?? NaN) ? null : selectedId}
          onSelectItem={handleSelectItem}
        />
        {showPagination && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  return (
    <Main>
      <section
        className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        aria-label="Search section"
      >
        <Search value={inputValue} onValueChange={handleInputChange} onSearch={handleSearch} />
      </section>

      <section
        className={`grid gap-4 ${hasDetailsOpen ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
        aria-label="Results and details"
      >
        <section
          className="min-h-[420px] rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Results section"
          onClick={handleMainPanelClick}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && detailsParam) {
              handleCloseDetails();
            }
          }}
        >
          {renderResults()}
        </section>

        <section
          aria-label="Details section"
          className={hasDetailsOpen ? '' : 'hidden'}
          aria-hidden={!hasDetailsOpen}
        >
          <Outlet context={outletContext} />
        </section>
      </section>
    </Main>
  );
};
