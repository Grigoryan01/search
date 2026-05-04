import type { Product, ProductResponse } from './types';

const API_BASE_URL = 'https://dummyjson.com/products';
const PAGE_SIZE = 10;

const createRequestUrl = (searchTerm: string): string => {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: '0',
  });

  if (searchTerm) {
    params.append('q', searchTerm);
    return `${API_BASE_URL}/search?${params.toString()}`;
  }

  return `${API_BASE_URL}?${params.toString()}`;
};

export const fetchFirstPageProducts = async (searchTerm: string): Promise<Product[]> => {
  const requestUrl = createRequestUrl(searchTerm);
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ProductResponse;
  return payload.products;
};
