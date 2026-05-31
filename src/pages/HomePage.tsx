import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '../api';
import { CardList } from '../components/CardList';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { Main } from '../components/Main';
import { Pagination } from '../components/Pagination';
import { RefreshButton } from '../components/RefreshButton';
import { Search } from '../components/Search';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { productKeys } from '../lib/queryKeys';
import { useSelectedItemsStore } from '../store/selectedItemsStore';
import type { Product } from '../types';

const SEARCH_STORAGE_KEY = 'searchTerm';
const LIST_ERROR_MESSAGE = 'Unable to load items. Please try again in a moment.';

const parsePage = (rawPage: string | null): number => {
  const parsed = Number(rawPage ?? '1');
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
};

export const HomePage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const toggleSelectedItem = useSelectedItemsStore((state) => state.toggleItem);
  const selectedItems = useSelectedItemsStore((state) => state.selectedItems);
  const checkedIds = useMemo(
    () => new Set(Object.keys(selectedItems).map(Number)),
    [selectedItems]
  );
  const { storedValue: persistedSearch, setValue: setPersistedSearch } =
    useLocalStorage(SEARCH_STORAGE_KEY);

  const page = parsePage(searchParams.get('page'));
  const detailsParam = searchParams.get('details');
  const selectedId = detailsParam ? Number(detailsParam) : null;

  const [inputValue, setInputValue] = useState(persistedSearch);
  const [lastSubmittedSearch, setLastSubmittedSearch] = useState(persistedSearch);

  const {
    data,
    isPending,
    isError,
    isFetching,
    isRefetching,
  } = useProductsQuery(lastSubmittedSearch, page);

  const items = data?.products ?? [];
  const total = data?.total ?? 0;
  const isLoading = isPending || (isRefetching && items.length === 0);
  const errorMessage = isError ? LIST_ERROR_MESSAGE : '';

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

  const handleOpenDetails = (id: number) => {
    updateSearchParams((params) => {
      params.set('details', String(id));
    });
  };

  const handleToggleCheck = (item: Product) => {
    toggleSelectedItem(item);
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

  const handleRefreshList = () => {
    void queryClient.invalidateQueries({
      queryKey: productKeys.list(lastSubmittedSearch, page),
    });
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
          checkedIds={checkedIds}
          detailsId={Number.isNaN(selectedId ?? NaN) ? null : selectedId}
          onToggleCheck={handleToggleCheck}
          onOpenDetails={handleOpenDetails}
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
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Search value={inputValue} onValueChange={handleInputChange} onSearch={handleSearch} />
          </div>
          <RefreshButton
            onRefresh={handleRefreshList}
            isRefreshing={isFetching && !isPending}
            label="Refresh list"
          />
        </div>
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
