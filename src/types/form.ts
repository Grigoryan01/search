export type FormType = 'uncontrolled' | 'hook';

export interface FormSubmission {
  id: string;
  formType: FormType;
  name: string;
  age: number;
  email: string;
  gender: string;
  acceptTerms: boolean;
  country: string;
  imageBase64: string;
  submittedAt: number;
  isNew: boolean;
}

export interface FormInputValues {
  name: string;
  age: number;
  email: string;
  gender: string;
  acceptTerms: boolean;
  password: string;
  confirmPassword: string;
  country: string;
  imageBase64: string;
}
