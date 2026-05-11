import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders loading text', () => {
    render(<LoadingIndicator />);

    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  it('has status role for accessibility', () => {
    render(<LoadingIndicator />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-live attribute for screen readers', () => {
    render(<LoadingIndicator />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
