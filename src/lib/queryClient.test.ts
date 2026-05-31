import { createQueryClient, createTestQueryClient } from './queryClient';

describe('query client factories', () => {
  it('creates a production client with query defaults', () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions().queries?.staleTime).toBeGreaterThan(0);
    expect(client.getDefaultOptions().queries?.gcTime).toBeGreaterThan(0);
  });

  it('creates a test client that keeps cached queries fresh', () => {
    const client = createTestQueryClient();

    expect(client.getDefaultOptions().queries?.staleTime).toBe(Infinity);
    expect(client.getDefaultOptions().queries?.retry).toBe(false);
  });
});
