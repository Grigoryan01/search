import { QueryClient } from '@tanstack/react-query';
import { getCacheTtlMs } from './cacheConfig';

export const createQueryClient = (): QueryClient => {
  const cacheTtlMs = getCacheTtlMs();

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheTtlMs,
        gcTime: cacheTtlMs,
        retry: 1,
      },
    },
  });
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
