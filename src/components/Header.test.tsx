import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the title text', () => {
    render(<Header title="Product Search" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Search');
  });

  it('renders inside a header element', () => {
    render(<Header title="Test Title" />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders different title values', () => {
    render(<Header title="Custom Title" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
  });
});
