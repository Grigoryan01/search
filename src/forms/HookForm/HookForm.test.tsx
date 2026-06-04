import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useFormStore } from '../../store/useFormStore';
import { HookForm } from './HookForm';

vi.mock('../../utils/imageToBase64', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/imageToBase64')>();
  return {
    ...actual,
    fileToBase64: vi.fn().mockResolvedValue('data:image/png;base64,dGVzdA=='),
  };
});

describe('HookForm', () => {
  it('disables submit while the form is invalid', () => {
    render(<HookForm onSuccess={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('submits valid data to the store', async () => {
    const user = userEvent.setup();
    useFormStore.setState({ submissions: [] });
    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });

    render(<HookForm onSuccess={() => undefined} />);

    await user.type(screen.getByLabelText('Name'), 'Bob');
    await user.type(screen.getByLabelText('Age'), '32');
    await user.type(screen.getByLabelText('Email'), 'bob@example.com');
    await user.click(screen.getByLabelText('Female'));
    await user.type(screen.getByLabelText('Password'), 'Bb2!pass');
    await user.type(screen.getByLabelText('Confirm password'), 'Bb2!pass');
    await user.type(screen.getByLabelText('Country'), 'Germany');
    await user.upload(screen.getByLabelText(/Profile image/i), file);
    await user.click(screen.getByLabelText(/Terms and Conditions/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(useFormStore.getState().submissions).toHaveLength(1);
    });
  });
});
