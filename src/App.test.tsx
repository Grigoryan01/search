import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeProvider';
import * as api from './api';
import { createTestQueryClient } from './lib/queryClient';
import { useSelectedItemsStore } from './store/selectedItemsStore';
import * as downloadCsv from './utils/downloadCsv';

vi.mock('./utils/downloadCsv', () => ({
  downloadSelectedItemsAsCsv: vi.fn(),
}));

vi.mock('./api', () => ({
  fetchProducts: vi.fn(),
  fetchProductById: vi.fn(),
  PAGE_SIZE: 10,
}));

const mockProducts = [
  { id: 1, title: 'iPhone 15', description: 'Latest Apple phone' },
  { id: 2, title: 'Samsung Galaxy', description: 'Android flagship' },
];

const mockProductsResult = {
  products: mockProducts,
  total: mockProducts.length,
};

const renderApp = (initialEntry = '/?page=1') => {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  };
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useSelectedItemsStore.setState({ selectedItems: {} });
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    vi.clearAllMocks();
    vi.mocked(api.fetchProducts).mockResolvedValue(mockProductsResult);
    vi.mocked(api.fetchProductById).mockResolvedValue(mockProducts[0]);
  });

  it('renders the header with correct title', async () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Search');
    await waitFor(() => {
      expect(api.fetchProducts).toHaveBeenCalled();
    });
  });

  it('renders search input and button', async () => {
    renderApp();

    expect(screen.getByRole('textbox', { name: /search products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(api.fetchProducts).toHaveBeenCalled();
    });
  });

  it('makes initial API call on mount with empty search', async () => {
    renderApp();

    await waitFor(() => {
      expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
    });
  });

  it('displays products after successful API call', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('shows loading indicator while fetching data', async () => {
    let resolvePromise: (value: typeof mockProductsResult) => void;
    vi.mocked(api.fetchProducts).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Loading items...')).toBeInTheDocument();
    });

    resolvePromise!(mockProductsResult);

    await waitFor(() => {
      expect(screen.queryByText('Loading items...')).not.toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(api.fetchProducts).mockRejectedValue(new Error('API Error'));

    renderApp();

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load items. Please try again in a moment.')
      ).toBeInTheDocument();
    });
  });

  it('displays empty state when no products are returned', async () => {
    vi.mocked(api.fetchProducts).mockResolvedValue({ products: [], total: 0 });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('No items found for this query.')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.clear(input);
      await user.type(input, 'phone');

      expect(input).toHaveValue('phone');
    });

    it('calls API with search term when search button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('phone', 1);
      });
    });

    it('trims whitespace from search input before searching', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, '  phone  ');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('phone', 1);
      });
    });

    it('does not re-fetch when submitting the same search term', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('phone', 1);
      });

      const callCountAfterSearch = vi.mocked(api.fetchProducts).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(vi.mocked(api.fetchProducts).mock.calls.length).toBe(callCountAfterSearch);
    });

    it('resets page to 1 when the search input changes', async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchProducts).mockResolvedValue({
        products: mockProducts,
        total: 30,
      });

      renderApp('/?page=3');

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 3);
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'a');

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
      });
    });
  });

  describe('localStorage integration', () => {
    it('reads search term from localStorage on mount', async () => {
      localStorage.setItem('searchTerm', 'saved query');

      renderApp();

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('saved query', 1);
      });

      expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue(
        'saved query'
      );
    });

    it('saves search term to localStorage when search button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'laptop');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(localStorage.getItem('searchTerm')).toBe('laptop');
    });

    it('handles empty localStorage value on mount', async () => {
      renderApp();

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
      });

      expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue('');
    });

    it('trims localStorage value on mount', async () => {
      localStorage.setItem('searchTerm', '  trimmed  ');

      renderApp();

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('trimmed', 1);
      });
    });

    it('overwrites existing localStorage value on new search', async () => {
      localStorage.setItem('searchTerm', 'old query');
      const user = userEvent.setup();

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.clear(input);
      await user.type(input, 'new query');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(localStorage.getItem('searchTerm')).toBe('new query');
    });
  });

  describe('pagination', () => {
    it('shows pagination after items are loaded', async () => {
      vi.mocked(api.fetchProducts).mockResolvedValue({
        products: mockProducts,
        total: 30,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });
    });

    it('does not show pagination while loading', async () => {
      let resolvePromise: (value: { products: typeof mockProducts; total: number }) => void;
      vi.mocked(api.fetchProducts).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Loading items...')).toBeInTheDocument();
      });

      expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();

      resolvePromise!({ products: mockProducts, total: 30 });

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });
    });

    it('loads the selected page when pagination is used', async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchProducts).mockResolvedValue({
        products: mockProducts,
        total: 30,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Page 2' }));

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 2);
      });

      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    });

    it('reuses cached data when returning to a previously visited page', async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchProducts).mockResolvedValue({
        products: mockProducts,
        total: 30,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Page 2' }));

      await waitFor(() => {
        expect(api.fetchProducts).toHaveBeenCalledWith('', 2);
      });

      const callsAfterPageTwo = vi.mocked(api.fetchProducts).mock.calls.length;

      await user.click(screen.getByRole('button', { name: 'Page 1' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
      });

      expect(vi.mocked(api.fetchProducts).mock.calls.length).toBe(callsAfterPageTwo);
    });

    it('refetches the current page when refresh list is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const initialCalls = vi.mocked(api.fetchProducts).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /refresh list/i }));

      await waitFor(() => {
        expect(vi.mocked(api.fetchProducts).mock.calls.length).toBeGreaterThan(initialCalls);
      });

      expect(api.fetchProducts).toHaveBeenCalledWith('', 1);
    });
  });

  describe('selected items and flyout', () => {
    it('stores checkbox selections in application state', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox', { name: /select iphone 15/i }));

      expect(useSelectedItemsStore.getState().isSelected(1)).toBe(true);
      expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    it('removes an item from state when unchecked', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /select iphone 15/i });
      await user.click(checkbox);
      await user.click(checkbox);

      expect(useSelectedItemsStore.getState().isSelected(1)).toBe(false);
      expect(screen.queryByText(/item selected/i)).not.toBeInTheDocument();
    });

    it('keeps selections when navigating to About and back', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox', { name: /select iphone 15/i }));
      await user.click(screen.getByRole('link', { name: /about/i }));
      await user.click(screen.getByRole('link', { name: /home/i }));

      expect(useSelectedItemsStore.getState().isSelected(1)).toBe(true);
      expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    it('clears all selections from the flyout', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox', { name: /select iphone 15/i }));
      await user.click(screen.getByRole('checkbox', { name: /select samsung galaxy/i }));
      await user.click(screen.getByRole('button', { name: /unselect all/i }));

      expect(useSelectedItemsStore.getState().selectedItems).toEqual({});
    });

    it('downloads selected items as CSV from the flyout', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox', { name: /select iphone 15/i }));
      await user.click(screen.getByRole('button', { name: /^download$/i }));

      expect(downloadCsv.downloadSelectedItemsAsCsv).toHaveBeenCalledWith([mockProducts[0]]);
    });

    it('does not open details when only the checkbox is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox', { name: /select iphone 15/i }));

      expect(screen.queryByLabelText(/item details/i)).not.toBeInTheDocument();
      expect(api.fetchProductById).not.toHaveBeenCalled();
    });
  });

  describe('theme switching', () => {
    it('renders theme controls at the top of the app', () => {
      renderApp();

      expect(screen.getByRole('group', { name: /theme selection/i })).toBeInTheDocument();
    });

    it('applies dark theme to the document when selected', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.click(screen.getByRole('radio', { name: /dark/i }));

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('master-detail', () => {
    it('opens details panel and loads item details', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /view details for iphone 15/i }));

      expect(screen.getByRole('region', { name: /details section/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(api.fetchProductById).toHaveBeenCalledWith(1);
      });

      expect(screen.getByLabelText(/item details/i)).toBeInTheDocument();
    });

    it('does not change checkbox selection when opening details', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /view details for iphone 15/i }));

      expect(useSelectedItemsStore.getState().isSelected(1)).toBe(false);
    });

    it('closes details when close button is clicked', async () => {
      const user = userEvent.setup();
      renderApp('/?page=1&details=1');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close details panel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close details panel/i }));

      await waitFor(() => {
        expect(screen.queryByLabelText(/item details/i)).not.toBeInTheDocument();
      });
    });

    it('caches item details and avoids refetch when reopening the same item', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /view details for iphone 15/i }));

      await waitFor(() => {
        expect(api.fetchProductById).toHaveBeenCalledWith(1);
      });

      const detailCallsAfterOpen = vi.mocked(api.fetchProductById).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /close details panel/i }));

      await waitFor(() => {
        expect(screen.queryByLabelText(/item details/i)).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /view details for iphone 15/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/item details/i)).toBeInTheDocument();
      });

      expect(vi.mocked(api.fetchProductById).mock.calls.length).toBe(detailCallsAfterOpen);
    });

    it('refetches details when refresh details is clicked', async () => {
      const user = userEvent.setup();
      renderApp('/?page=1&details=1');

      await waitFor(() => {
        expect(api.fetchProductById).toHaveBeenCalledWith(1);
      });

      const initialCalls = vi.mocked(api.fetchProductById).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /refresh details/i }));

      await waitFor(() => {
        expect(vi.mocked(api.fetchProductById).mock.calls.length).toBeGreaterThan(initialCalls);
      });
    });

    it('shows error message when details API call fails', async () => {
      vi.mocked(api.fetchProductById).mockRejectedValue(new Error('Details failed'));

      renderApp('/?page=1&details=1');

      await waitFor(() => {
        expect(
          screen.getByText('Unable to load item details. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('routing pages', () => {
    it('navigates to About page', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('link', { name: /about/i }));

      expect(screen.getByRole('heading', { level: 2, name: /about/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /rs school react course/i })).toHaveAttribute(
        'href',
        'https://rs.school/react/'
      );
    });

    it('shows 404 page for unknown routes', async () => {
      renderApp('/unknown-route');

      expect(screen.getByText('The page you are looking for was not found.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('displays error message on API failure', async () => {
      vi.mocked(api.fetchProducts).mockRejectedValue(new Error('Network error'));

      renderApp();

      await waitFor(() => {
        expect(
          screen.getByText('Unable to load items. Please try again in a moment.')
        ).toBeInTheDocument();
      });
    });

    it('clears products on API failure', async () => {
      vi.mocked(api.fetchProducts)
        .mockResolvedValueOnce(mockProductsResult)
        .mockRejectedValueOnce(new Error('API Error'));

      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'fail');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument();
      });
    });

    it('recovers from error when a subsequent search succeeds', async () => {
      vi.mocked(api.fetchProducts)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockProductsResult);

      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(
          screen.getByText('Unable to load items. Please try again in a moment.')
        ).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });
      expect(
        screen.queryByText('Unable to load items. Please try again in a moment.')
      ).not.toBeInTheDocument();
    });
  });

  describe('error boundary integration', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('triggers error boundary when Trigger Error button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <ThemeProvider>
            <MemoryRouter initialEntries={['/?page=1']}>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /trigger error/i }));

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('Please refresh the page to continue.')).toBeInTheDocument();
    });

    it('does not show app content after error is triggered', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <ThemeProvider>
            <MemoryRouter initialEntries={['/?page=1']}>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /trigger error/i }));

      expect(screen.queryByText('Product Search')).not.toBeInTheDocument();
      expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument();
    });
  });
});
