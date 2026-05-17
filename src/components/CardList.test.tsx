import { render, screen } from '@testing-library/react';
import { CardList } from './CardList';
import type { Product } from '../types';

describe('CardList', () => {
  const mockItems: Product[] = [
    { id: 1, title: 'Product One', description: 'Description for product one' },
    { id: 2, title: 'Product Two', description: 'Description for product two' },
    { id: 3, title: 'Product Three', description: 'Description for product three' },
  ];

  it('renders correct number of items when data is provided', () => {
    render(<CardList items={mockItems} />);

    const cards = screen.getAllByRole('button', { name: /view details for/i });
    expect(cards).toHaveLength(3);
  });

  it('displays "no items" message when data array is empty', () => {
    render(<CardList items={[]} />);

    expect(screen.getByText('No items found for this query.')).toBeInTheDocument();
  });

  it('does not render articles when data array is empty', () => {
    render(<CardList items={[]} />);

    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('correctly displays item names and descriptions', () => {
    render(<CardList items={mockItems} />);

    expect(screen.getByText('Product One')).toBeInTheDocument();
    expect(screen.getByText('Description for product one')).toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
    expect(screen.getByText('Description for product two')).toBeInTheDocument();
    expect(screen.getByText('Product Three')).toBeInTheDocument();
    expect(screen.getByText('Description for product three')).toBeInTheDocument();
  });

  it('renders a single item correctly', () => {
    render(<CardList items={[mockItems[0]]} />);

    expect(screen.getAllByRole('button', { name: /view details for/i })).toHaveLength(1);
    expect(screen.getByText('Product One')).toBeInTheDocument();
  });
});
