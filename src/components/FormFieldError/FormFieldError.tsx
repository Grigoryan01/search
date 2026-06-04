import './FormFieldError.css';

interface FormFieldErrorProps {
  message?: string;
  id?: string;
}

export function FormFieldError({ message, id }: FormFieldErrorProps) {
  return (
    <p className="field-error" id={id} role="alert" aria-live="polite">
      {message ?? '\u00A0'}
    </p>
  );
}
