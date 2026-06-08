import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useFormStore } from '../../store/useFormStore';
import { UncontrolledForm } from './UncontrolledForm';

vi.mock('../../utils/imageToBase64', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/imageToBase64')>();
  return {
    ...actual,
    fileToBase64: vi.fn().mockResolvedValue('data:image/png;base64,dGVzdA=='),
  };
});

describe('UncontrolledForm', () => {
  it('shows validation errors only after submit', async () => {
    const user = userEvent.setup();
    useFormStore.setState({ submissions: [] });

    render(<UncontrolledForm onSuccess={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(useFormStore.getState().submissions).toHaveLength(0);
  });

  it('submits valid data to the store', async () => {
    const user = userEvent.setup();
    useFormStore.setState({ submissions: [] });

    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });

    render(<UncontrolledForm onSuccess={() => undefined} />);

    await user.type(screen.getByLabelText('Name'), 'Alice');
    await user.type(screen.getByLabelText('Age'), '28');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.click(screen.getByLabelText('Male'));
    await user.type(screen.getByLabelText('Password'), 'Aa1!pass');
    await user.type(screen.getByLabelText('Confirm password'), 'Aa1!pass');
    await user.type(screen.getByLabelText('Country'), 'Canada');
    await user.upload(screen.getByLabelText(/Profile image/i), file);
    await user.click(screen.getByLabelText(/Terms and Conditions/i));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(useFormStore.getState().submissions).toHaveLength(1);
    });

    expect(useFormStore.getState().submissions[0].name).toBe('Alice');
  });
});
