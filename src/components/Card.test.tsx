import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import type { Product } from '../types';

describe('Card', () => {
  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    description: 'A great product for testing purposes',
  };

  it('displays item title correctly', () => {
    render(<Card item={mockProduct} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Product');
  });

  it('displays item description correctly', () => {
    render(<Card item={mockProduct} />);

    expect(screen.getByText('A great product for testing purposes')).toBeInTheDocument();
  });

  it('renders as a selectable button element', () => {
    render(<Card item={mockProduct} />);

    expect(
      screen.getByRole('button', { name: /view details for test product/i })
    ).toBeInTheDocument();
  });

  it('handles long title and description', () => {
    const longProduct: Product = {
      id: 2,
      title: 'A'.repeat(200),
      description: 'B'.repeat(500),
    };
    render(<Card item={longProduct} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('A'.repeat(200));
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });

  it('handles special characters in title and description', () => {
    const specialProduct: Product = {
      id: 3,
      title: '<script>alert("xss")</script>',
      description: 'Price: $9.99 & "free" shipping',
    };
    render(<Card item={specialProduct} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      '<script>alert("xss")</script>'
    );
    expect(screen.getByText('Price: $9.99 & "free" shipping')).toBeInTheDocument();
  });
});
