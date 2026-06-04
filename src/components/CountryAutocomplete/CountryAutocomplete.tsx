import { useId } from 'react';

import { useFormStore } from '../../store/useFormStore';
import { FormFieldError } from '../FormFieldError/FormFieldError';
import { getCountryInputValueProps } from './countryInputProps';
import './CountryAutocomplete.css';

interface CountryAutocompleteProps {
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function CountryAutocomplete({
  id: externalId,
  name = 'country',
  defaultValue,
  value,
  error,
  onChange,
  onBlur,
}: CountryAutocompleteProps) {
  const generatedId = useId();
  const inputId = externalId ?? `country-${generatedId}`;
  const listId = `${inputId}-list`;
  const countries = useFormStore((state) => state.countries);

  const inputValueProps = getCountryInputValueProps(value, defaultValue);

  return (
    <div className="form-field">
      <label htmlFor={inputId}>Country</label>
      <input
        id={inputId}
        name={name}
        type="text"
        list={listId}
        {...inputValueProps}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <datalist id={listId}>
        {countries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      <FormFieldError message={error} id={`${inputId}-error`} />
    </div>
  );
}
