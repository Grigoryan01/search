import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders a checkbox for selection', () => {
    render(<Card item={mockProduct} />);

    expect(screen.getByRole('checkbox', { name: /select test product/i })).toBeInTheDocument();
  });

  it('renders a button to open details', () => {
    render(<Card item={mockProduct} />);

    expect(
      screen.getByRole('button', { name: /view details for test product/i })
    ).toBeInTheDocument();
  });

  it('calls onToggleCheck when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggleCheck = vi.fn();

    render(<Card item={mockProduct} onToggleCheck={onToggleCheck} />);

    await user.click(screen.getByRole('checkbox', { name: /select test product/i }));

    expect(onToggleCheck).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onOpenDetails when card content is clicked', async () => {
    const user = userEvent.setup();
    const onOpenDetails = vi.fn();

    render(<Card item={mockProduct} onOpenDetails={onOpenDetails} />);

    await user.click(screen.getByRole('button', { name: /view details for test product/i }));

    expect(onOpenDetails).toHaveBeenCalledWith(1);
  });

  it('does not call onOpenDetails when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onOpenDetails = vi.fn();
    const onToggleCheck = vi.fn();

    render(
      <Card item={mockProduct} onOpenDetails={onOpenDetails} onToggleCheck={onToggleCheck} />
    );

    await user.click(screen.getByRole('checkbox', { name: /select test product/i }));

    expect(onToggleCheck).toHaveBeenCalled();
    expect(onOpenDetails).not.toHaveBeenCalled();
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
