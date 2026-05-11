import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as api from './api';

vi.mock('./api', () => ({
  fetchFirstPageProducts: vi.fn(),
}));

const mockProducts = [
  { id: 1, title: 'iPhone 15', description: 'Latest Apple phone' },
  { id: 2, title: 'Samsung Galaxy', description: 'Android flagship' },
];

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.fetchFirstPageProducts).mockResolvedValue(mockProducts);
  });

  it('renders the header with correct title', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Search');
    await waitFor(() => {
      expect(api.fetchFirstPageProducts).toHaveBeenCalled();
    });
  });

  it('renders search input and button', async () => {
    render(<App />);

    expect(screen.getByRole('textbox', { name: /search products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(api.fetchFirstPageProducts).toHaveBeenCalled();
    });
  });

  it('makes initial API call on mount with empty search', async () => {
    render(<App />);

    await waitFor(() => {
      expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('');
    });
  });

  it('displays products after successful API call', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('shows loading indicator while fetching data', async () => {
    let resolvePromise: (value: typeof mockProducts) => void;
    vi.mocked(api.fetchFirstPageProducts).mockImplementation(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Loading items...')).toBeInTheDocument();
    });

    resolvePromise!(mockProducts);

    await waitFor(() => {
      expect(screen.queryByText('Loading items...')).not.toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(api.fetchFirstPageProducts).mockRejectedValue(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load items. Please try again in a moment.')
      ).toBeInTheDocument();
    });
  });

  it('displays empty state when no products are returned', async () => {
    vi.mocked(api.fetchFirstPageProducts).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No items found for this query.')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup();
      render(<App />);

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
      render(<App />);

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('');
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('phone');
      });
    });

    it('trims whitespace from search input before searching', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('');
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, '  phone  ');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('phone');
      });
    });

    it('does not re-fetch when submitting the same search term', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('phone');
      });

      const callCountAfterSearch = vi.mocked(api.fetchFirstPageProducts).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(vi.mocked(api.fetchFirstPageProducts).mock.calls.length).toBe(callCountAfterSearch);
    });
  });

  describe('localStorage integration', () => {
    it('reads search term from localStorage on mount', async () => {
      localStorage.setItem('searchTerm', 'saved query');

      render(<App />);

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('saved query');
      });

      expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue(
        'saved query'
      );
    });

    it('saves search term to localStorage when search button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'laptop');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(localStorage.getItem('searchTerm')).toBe('laptop');
    });

    it('handles empty localStorage value on mount', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('');
      });

      expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue('');
    });

    it('trims localStorage value on mount', async () => {
      localStorage.setItem('searchTerm', '  trimmed  ');

      render(<App />);

      await waitFor(() => {
        expect(api.fetchFirstPageProducts).toHaveBeenCalledWith('trimmed');
      });
    });

    it('overwrites existing localStorage value on new search', async () => {
      localStorage.setItem('searchTerm', 'old query');
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.clear(input);
      await user.type(input, 'new query');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(localStorage.getItem('searchTerm')).toBe('new query');
    });
  });

  describe('error handling', () => {
    it('displays error message on API failure', async () => {
      vi.mocked(api.fetchFirstPageProducts).mockRejectedValue(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText('Unable to load items. Please try again in a moment.')
        ).toBeInTheDocument();
      });
    });

    it('clears products on API failure', async () => {
      vi.mocked(api.fetchFirstPageProducts)
        .mockResolvedValueOnce(mockProducts)
        .mockRejectedValueOnce(new Error('API Error'));

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'fail');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument();
      });
    });

    it('recovers from error when a subsequent search succeeds', async () => {
      vi.mocked(api.fetchFirstPageProducts)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockProducts);

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText('Unable to load items. Please try again in a moment.')
        ).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /search products/i });
      await user.type(input, 'phone');
      await user.click(screen.getByRole('button', { name: /search/i }));

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
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
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
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
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
