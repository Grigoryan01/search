import { fetchProductById, fetchProducts, PAGE_SIZE } from './api';

describe('fetchProducts', () => {
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
              total: 42,
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

  it('returns products and total on successful response', async () => {
    const result = await fetchProducts('', 1);

    expect(result.products).toEqual([
      { id: 1, title: 'Product 1', description: 'Desc 1' },
      { id: 2, title: 'Product 2', description: 'Desc 2' },
    ]);
    expect(result.total).toBe(42);
  });

  it('calls API with correct URL for empty search term', async () => {
    await fetchProducts('', 1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://dummyjson.com/products?')
    );
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('skip=0'));
  });

  it('calls search endpoint with query parameter for non-empty search term', async () => {
    await fetchProducts('phone', 1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://dummyjson.com/products/search?')
    );
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=phone'));
  });

  it('uses skip based on page number', async () => {
    await fetchProducts('', 3);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('skip')).toBe(String((3 - 1) * PAGE_SIZE));
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

    await expect(fetchProducts('nonexistent', 1)).rejects.toThrow(
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

    await expect(fetchProducts('', 1)).rejects.toThrow('Request failed with status 500');
  });

  it('throws error when fetch itself fails (network error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error')))
    );

    await expect(fetchProducts('', 1)).rejects.toThrow('Network error');
  });
});

describe('fetchProductById', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 7,
              title: 'Detail Product',
              description: 'Detail description',
            }),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a product by id', async () => {
    const product = await fetchProductById(7);

    expect(product).toEqual({
      id: 7,
      title: 'Detail Product',
      description: 'Detail description',
    });
  });

  it('calls the product detail endpoint', async () => {
    await fetchProductById(7);

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products/7');
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      )
    );

    await expect(fetchProductById(999)).rejects.toThrow('Request failed with status 404');
  });
});
