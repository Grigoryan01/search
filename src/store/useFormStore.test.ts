import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFormStore } from './useFormStore';

describe('useFormStore', () => {
  beforeEach(() => {
    useFormStore.setState({ submissions: [] });
    vi.useFakeTimers();
  });

  it('stores submissions and clears the new highlight flag', () => {
    const { addSubmission } = useFormStore.getState();

    addSubmission({
      formType: 'hook',
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
      gender: 'Female',
      acceptTerms: true,
      country: 'Canada',
      imageBase64: 'data:image/png;base64,abc',
    });

    const [submission] = useFormStore.getState().submissions;
    expect(submission.isNew).toBe(true);
    expect(useFormStore.getState().countries).toContain('Canada');

    vi.advanceTimersByTime(3000);
    expect(useFormStore.getState().submissions[0].isNew).toBe(false);

    vi.useRealTimers();
  });
});
