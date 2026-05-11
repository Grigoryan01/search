import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from './Search';

describe('Search', () => {
  const defaultProps = {
    value: '',
    onValueChange: vi.fn(),
    onSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and search button', () => {
    render(<Search {...defaultProps} />);

    expect(screen.getByRole('textbox', { name: /search products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('displays provided value in the input', () => {
    render(<Search {...defaultProps} value="test query" />);

    expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue('test query');
  });

  it('shows empty input when value is empty', () => {
    render(<Search {...defaultProps} value="" />);

    expect(screen.getByRole('textbox', { name: /search products/i })).toHaveValue('');
  });

  it('calls onValueChange when user types in the input', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(<Search {...defaultProps} onValueChange={onValueChange} />);

    const input = screen.getByRole('textbox', { name: /search products/i });
    await user.type(input, 'a');

    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('calls onSearch when search button is clicked', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<Search {...defaultProps} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('renders the placeholder text', () => {
    render(<Search {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search products')).toBeInTheDocument();
  });
});
