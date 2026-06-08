import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { CountryAutocomplete } from '../../components/CountryAutocomplete/CountryAutocomplete';
import { FormFieldError } from '../../components/FormFieldError/FormFieldError';
import { PasswordStrength } from '../../components/PasswordStrength/PasswordStrength';
import { useFormStore } from '../../store/useFormStore';
import { fileToBase64, validateImageFile } from '../../utils/imageToBase64';
import { formSchema } from '../../validation/formSchema';
import type { FormInputValues } from '../../types/form';
import '../../styles/forms.css';

interface HookFormProps {
  onSuccess: () => void;
}

const defaultValues: FormInputValues = {
  name: '',
  age: 0,
  email: '',
  gender: '',
  acceptTerms: false,
  password: '',
  confirmPassword: '',
  country: '',
  imageBase64: '',
};

export function HookForm({ onSuccess }: HookFormProps) {
  const addSubmission = useFormStore((state) => state.addSubmission);
  const [imageError, setImageError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormInputValues>({
    resolver: zodResolver(formSchema) as Resolver<FormInputValues>,
    mode: 'onChange',
    defaultValues,
  });

  const passwordValue = watch('password');

  const onSubmit = handleSubmit((values) => {
    addSubmission({
      formType: 'hook',
      name: values.name,
      age: values.age,
      email: values.email,
      gender: values.gender,
      acceptTerms: values.acceptTerms,
      country: values.country,
      imageBase64: values.imageBase64,
    });

    reset(defaultValues);
    setImageError(undefined);
    onSuccess();
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setValue('imageBase64', '', { shouldValidate: true });
      setImageError('Image is required');
      return;
    }

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setValue('imageBase64', '', { shouldValidate: true });
      setImageError(validationMessage);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setValue('imageBase64', base64, { shouldValidate: true });
      setImageError(undefined);
    } catch {
      setValue('imageBase64', '', { shouldValidate: true });
      setImageError('Failed to process image');
    }
  };

  const countryError = errors.country?.message;
  const imageFieldError = imageError ?? errors.imageBase64?.message;

  return (
    <form className="profile-form" onSubmit={onSubmit} noValidate data-testid="hook-form">
      <div className="form-field">
        <label htmlFor="hf-name">Name</label>
        <input
          id="hf-name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        <FormFieldError message={errors.name?.message} />
      </div>

      <div className="form-field">
        <label htmlFor="hf-age">Age</label>
        <input
          id="hf-age"
          type="number"
          min="0"
          aria-invalid={Boolean(errors.age)}
          {...register('age', { valueAsNumber: true })}
        />
        <FormFieldError message={errors.age?.message} />
      </div>

      <div className="form-field">
        <label htmlFor="hf-email">Email</label>
        <input
          id="hf-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        <FormFieldError message={errors.email?.message} />
      </div>

      <fieldset className="form-field">
        <legend>Gender</legend>
        <div className="gender-options" role="radiogroup" aria-label="Gender">
          <label htmlFor="hf-gender-male">
            <input id="hf-gender-male" type="radio" value="Male" {...register('gender')} />
            Male
          </label>
          <label htmlFor="hf-gender-female">
            <input id="hf-gender-female" type="radio" value="Female" {...register('gender')} />
            Female
          </label>
          <label htmlFor="hf-gender-other">
            <input id="hf-gender-other" type="radio" value="Other" {...register('gender')} />
            Other
          </label>
        </div>
        <FormFieldError message={errors.gender?.message} />
      </fieldset>

      <div className="form-field">
        <label htmlFor="hf-password">Password</label>
        <input
          id="hf-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        <PasswordStrength password={passwordValue} />
        <FormFieldError message={errors.password?.message} />
      </div>

      <div className="form-field">
        <label htmlFor="hf-confirm-password">Confirm password</label>
        <input
          id="hf-confirm-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        <FormFieldError message={errors.confirmPassword?.message} />
      </div>

      <CountryAutocomplete
        id="hf-country"
        name="country"
        value={watch('country')}
        error={countryError}
        onChange={(value) => setValue('country', value, { shouldValidate: true })}
        onBlur={() => setValue('country', watch('country'), { shouldValidate: true })}
      />

      <input type="hidden" {...register('imageBase64')} />

      <div className="form-field">
        <label htmlFor="hf-image">Profile image (PNG or JPEG, max 5MB)</label>
        <input
          id="hf-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleImageChange}
          aria-invalid={Boolean(imageFieldError)}
        />
        <FormFieldError message={imageFieldError} />
      </div>

      <div className="form-field form-field--inline">
        <input id="hf-terms" type="checkbox" {...register('acceptTerms')} />
        <label htmlFor="hf-terms">I accept the Terms and Conditions</label>
      </div>
      <FormFieldError message={errors.acceptTerms?.message} />

      <div className="form-actions">
        <button type="submit" disabled={!isValid}>
          Submit
        </button>
      </div>
    </form>
  );
}
