import { fetchFirstPageProducts } from './api';

describe('fetchFirstPageProducts', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              products: [
                { id: 1, title: 'Product 1', description: 'Desc 1' },
                { id: 2, title: 'Product 2', description: 'Desc 2' },
              ],
              total: 2,
              skip: 0,
              limit: 10,
            }),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns products on successful response', async () => {
    const products = await fetchFirstPageProducts('');

    expect(products).toEqual([
      { id: 1, title: 'Product 1', description: 'Desc 1' },
      { id: 2, title: 'Product 2', description: 'Desc 2' },
    ]);
  });

  it('calls API with correct URL for empty search term', async () => {
    await fetchFirstPageProducts('');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://dummyjson.com/products?')
    );
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('skip=0'));
  });

  it('calls search endpoint with query parameter for non-empty search term', async () => {
    await fetchFirstPageProducts('phone');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://dummyjson.com/products/search?')
    );
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=phone'));
  });

  it('throws error when response is not ok (4xx)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      )
    );

    await expect(fetchFirstPageProducts('nonexistent')).rejects.toThrow(
      'Request failed with status 404'
    );
  });

  it('throws error when response is not ok (5xx)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      )
    );

    await expect(fetchFirstPageProducts('')).rejects.toThrow('Request failed with status 500');
  });

  it('throws error when fetch itself fails (network error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error')))
    );

    await expect(fetchFirstPageProducts('')).rejects.toThrow('Network error');
  });

  it('includes pagination parameters in the request', async () => {
    await fetchFirstPageProducts('test');

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('skip')).toBe('0');
  });
});
