import { create } from 'zustand';

import { COUNTRIES } from '../data/countries';
import type { FormSubmission, FormType } from '../types/form';

const NEW_HIGHLIGHT_MS = 3000;

interface AddSubmissionPayload {
  formType: FormType;
  name: string;
  age: number;
  email: string;
  gender: string;
  acceptTerms: boolean;
  country: string;
  imageBase64: string;
}

interface FormStoreState {
  countries: readonly string[];
  submissions: FormSubmission[];
  addSubmission: (payload: AddSubmissionPayload) => string;
}

export const useFormStore = create<FormStoreState>((set) => ({
  countries: COUNTRIES,
  submissions: [],
  addSubmission: (payload) => {
    const id = crypto.randomUUID();
    const submission: FormSubmission = {
      id,
      ...payload,
      submittedAt: Date.now(),
      isNew: true,
    };

    set((state) => ({
      submissions: [submission, ...state.submissions],
    }));

    window.setTimeout(() => {
      set((state) => ({
        submissions: state.submissions.map((item) =>
          item.id === id ? { ...item, isNew: false } : item,
        ),
      }));
    }, NEW_HIGHLIGHT_MS);

    return id;
  },
}));
