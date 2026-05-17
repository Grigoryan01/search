import type { Product, ProductResponse } from './types';

const API_BASE_URL = 'https://dummyjson.com/products';
export const PAGE_SIZE = 10;

export type ProductsResult = {
  products: Product[];
  total: number;
};

const createRequestUrl = (searchTerm: string, page: number): string => {
  const skip = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
  });

  if (searchTerm) {
    params.append('q', searchTerm);
    return `${API_BASE_URL}/search?${params.toString()}`;
  }

  return `${API_BASE_URL}?${params.toString()}`;
};

export const fetchProducts = async (
  searchTerm: string,
  page: number
): Promise<ProductsResult> => {
  const requestUrl = createRequestUrl(searchTerm, page);
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ProductResponse;
  return { products: payload.products, total: payload.total };
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Product;
  return {
    id: payload.id,
    title: payload.title,
    description: payload.description,
  };
};

/** @deprecated Use fetchProducts for paginated requests */
export const fetchFirstPageProducts = async (searchTerm: string): Promise<Product[]> => {
  const result = await fetchProducts(searchTerm, 1);
  return result.products;
};
