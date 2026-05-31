export const buildProductDetailsUrl = (productId: number, page = 1): string => {
  const url = new URL(window.location.origin);
  url.pathname = '/';
  url.search = `?page=${page}&details=${productId}`;
  return url.toString();
};
