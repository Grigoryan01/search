import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as api from './api';

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

const renderApp = (initialEntry = '/?page=1') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
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
        <MemoryRouter initialEntries={['/?page=1']}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </MemoryRouter>
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
        <MemoryRouter initialEntries={['/?page=1']}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </MemoryRouter>
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
