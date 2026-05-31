import type { Product } from '../types';
import { downloadSelectedItemsAsCsv } from './downloadCsv';

describe('downloadSelectedItemsAsCsv', () => {
  const products: Product[] = [
    { id: 1, title: 'Phone', description: 'A phone' },
    { id: 2, title: 'Laptop', description: 'A laptop' },
  ];

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when there are no selected items', () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL');

    downloadSelectedItemsAsCsv([]);

    expect(createObjectUrlSpy).not.toHaveBeenCalled();
  });

  it('creates a downloadable CSV link for selected items', () => {
    const clickMock = vi.fn();
    const link = {
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(link);

    downloadSelectedItemsAsCsv(products);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(link.download).toBe('2_items.csv');
    expect(clickMock).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
