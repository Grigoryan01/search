import { useRef, useState } from 'react';

import { Modal } from './components/Modal/Modal';
import { SubmissionCard } from './components/SubmissionCard/SubmissionCard';
import { HookForm } from './forms/HookForm/HookForm';
import { UncontrolledForm } from './forms/UncontrolledForm/UncontrolledForm';
import { useFormStore } from './store/useFormStore';
import './App.css';

type ActiveForm = 'uncontrolled' | 'hook' | null;

function App() {
  const submissions = useFormStore((state) => state.submissions);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const uncontrolledTriggerRef = useRef<HTMLButtonElement>(null);
  const hookTriggerRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => setActiveForm(null);

  const returnFocusRef = activeForm === 'uncontrolled' ? uncontrolledTriggerRef : hookTriggerRef;

  const modalTitles: Record<Exclude<ActiveForm, null>, string> = {
    uncontrolled: 'Uncontrolled Form',
    hook: 'React Hook Form',
  };
  const modalTitle = activeForm ? modalTitles[activeForm] : '';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Forms Application</h1>
        <p>Submit profile data using an uncontrolled form or React Hook Form.</p>
        <div className="app-header__actions">
          <button
            ref={uncontrolledTriggerRef}
            type="button"
            onClick={() => setActiveForm('uncontrolled')}
          >
            Open Uncontrolled Form
          </button>
          <button ref={hookTriggerRef} type="button" onClick={() => setActiveForm('hook')}>
            Open React Hook Form
          </button>
        </div>
      </header>

      <main className="app-main">
        <section aria-labelledby="submissions-heading">
          <h2 id="submissions-heading">Submitted profiles</h2>
          {submissions.length === 0 ? (
            <p className="empty-state">No submissions yet. Open a form to get started.</p>
          ) : (
            <div className="submissions-grid">
              {submissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={activeForm !== null}
        title={modalTitle}
        onClose={closeModal}
        returnFocusRef={returnFocusRef}
      >
        {activeForm === 'uncontrolled' ? <UncontrolledForm onSuccess={closeModal} /> : null}
        {activeForm === 'hook' ? <HookForm onSuccess={closeModal} /> : null}
      </Modal>
    </div>
  );
}

export default App;
