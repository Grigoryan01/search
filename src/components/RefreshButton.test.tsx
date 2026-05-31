import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefreshButton } from './RefreshButton';

describe('RefreshButton', () => {
  it('calls onRefresh when clicked', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(<RefreshButton onRefresh={onRefresh} label="Refresh list" />);

    await user.click(screen.getByRole('button', { name: /refresh list/i }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the button while refreshing', () => {
    render(<RefreshButton onRefresh={vi.fn()} isRefreshing label="Refresh list" />);

    expect(screen.getByRole('button', { name: /refresh list/i })).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });
});
