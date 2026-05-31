import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api';
import { productKeys } from '../lib/queryKeys';

export const useProductDetailsQuery = (id: number, enabled: boolean) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled,
  });
