import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as api from '../api';
import { createTestQueryClient } from '../lib/queryClient';
import { useProductDetailsQuery } from './useProductDetailsQuery';
import { useProductsQuery } from './useProductsQuery';

vi.mock('../api', () => ({
  fetchProducts: vi.fn(),
  fetchProductById: vi.fn(),
  PAGE_SIZE: 10,
}));

const mockProductsResult = {
  products: [{ id: 1, title: 'Phone', description: 'A phone' }],
  total: 1,
};

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { Wrapper, queryClient };
};

describe('useProductsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchProducts).mockResolvedValue(mockProductsResult);
  });

  it('enters a loading state before data is available', () => {
    vi.mocked(api.fetchProducts).mockImplementation(
      () =>
        new Promise(() => {
          /* pending */
        })
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useProductsQuery('', 1), { wrapper: Wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns cached data without refetching for the same query key', async () => {
    const { Wrapper } = createWrapper();
    const { result, rerender } = renderHook(() => useProductsQuery('phone', 1), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.fetchProducts).toHaveBeenCalledTimes(1);

    rerender();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockProductsResult);
    });

    expect(api.fetchProducts).toHaveBeenCalledTimes(1);
  });

  it('exposes an error state when the request fails', async () => {
    vi.mocked(api.fetchProducts).mockRejectedValue(new Error('Network error'));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useProductsQuery('', 1), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useProductDetailsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchProductById).mockResolvedValue(mockProductsResult.products[0]);
  });

  it('does not fetch when disabled', () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useProductDetailsQuery(1, false), { wrapper: Wrapper });

    expect(api.fetchProductById).not.toHaveBeenCalled();
  });

  it('caches details for the same item id', async () => {
    const { Wrapper } = createWrapper();
    const { result, rerender } = renderHook(() => useProductDetailsQuery(1, true), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.fetchProductById).toHaveBeenCalledTimes(1);

    rerender();

    await waitFor(() => {
      expect(result.current.data?.title).toBe('Phone');
    });

    expect(api.fetchProductById).toHaveBeenCalledTimes(1);
  });
});
