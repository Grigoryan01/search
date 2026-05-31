import { buildProductDetailsUrl } from './productDetailsUrl';

describe('buildProductDetailsUrl', () => {
  it('builds a details URL with page and product id', () => {
    const url = buildProductDetailsUrl(42, 3);

    expect(url).toContain('details=42');
    expect(url).toContain('page=3');
  });
});
