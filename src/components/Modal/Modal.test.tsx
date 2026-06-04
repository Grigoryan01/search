import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Modal } from './Modal';

function ModalHarness() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        Open modal
      </button>
      <Modal
        isOpen={isOpen}
        title="Test modal"
        onClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      >
        <button type="button">Inside modal</button>
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('renders in a portal and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    await user.click(screen.getByRole('button', { name: 'Open modal' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.modal-backdrop')?.parentElement).toBe(document.body);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
