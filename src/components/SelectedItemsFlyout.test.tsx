import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelectedItemsStore } from '../store/selectedItemsStore';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';
import * as downloadCsv from '../utils/downloadCsv';

vi.mock('../utils/downloadCsv', () => ({
  downloadSelectedItemsAsCsv: vi.fn(),
}));

describe('SelectedItemsFlyout', () => {
  beforeEach(() => {
    useSelectedItemsStore.setState({ selectedItems: {} });
    vi.clearAllMocks();
  });

  it('does not render when no items are selected', () => {
    render(<SelectedItemsFlyout />);

    expect(screen.queryByRole('region', { name: /selected items actions/i })).not.toBeInTheDocument();
  });

  it('shows selected count and action buttons', () => {
    useSelectedItemsStore.setState({
      selectedItems: {
        1: { id: 1, title: 'Phone', description: 'Smartphone' },
        2: { id: 2, title: 'Laptop', description: 'Notebook' },
      },
    });

    render(<SelectedItemsFlyout />);

    expect(screen.getByText('2 items selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unselect all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^download$/i })).toBeInTheDocument();
  });

  it('clears all selections when Unselect all is clicked', async () => {
    const user = userEvent.setup();
    useSelectedItemsStore.setState({
      selectedItems: {
        1: { id: 1, title: 'Phone', description: 'Smartphone' },
      },
    });

    render(<SelectedItemsFlyout />);

    await user.click(screen.getByRole('button', { name: /unselect all/i }));

    expect(useSelectedItemsStore.getState().selectedItems).toEqual({});
  });

  it('downloads CSV when Download is clicked', async () => {
    const user = userEvent.setup();
    const selected = { id: 1, title: 'Phone', description: 'Smartphone' };
    useSelectedItemsStore.setState({ selectedItems: { 1: selected } });

    render(<SelectedItemsFlyout />);

    await user.click(screen.getByRole('button', { name: /^download$/i }));

    expect(downloadCsv.downloadSelectedItemsAsCsv).toHaveBeenCalledWith([selected]);
  });
});
