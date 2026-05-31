import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api';
import { productKeys } from '../lib/queryKeys';

export const useProductsQuery = (searchTerm: string, page: number) =>
  useQuery({
    queryKey: productKeys.list(searchTerm, page),
    queryFn: () => fetchProducts(searchTerm, page),
  });
