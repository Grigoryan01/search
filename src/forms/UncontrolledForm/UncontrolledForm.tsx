import { useRef, useState, type FormEvent } from 'react';

import { CountryAutocomplete } from '../../components/CountryAutocomplete/CountryAutocomplete';
import { FormFieldError } from '../../components/FormFieldError/FormFieldError';
import { PasswordStrength } from '../../components/PasswordStrength/PasswordStrength';
import { useFormStore } from '../../store/useFormStore';
import { fileToBase64, validateImageFile } from '../../utils/imageToBase64';
import { formSchema, formatZodErrors } from '../../validation/formSchema';
import '../../styles/forms.css';

interface UncontrolledFormProps {
  onSuccess: () => void;
}

export function UncontrolledForm({ onSuccess }: UncontrolledFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const addSubmission = useFormStore((state) => state.addSubmission);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordPreview, setPasswordPreview] = useState('');

  const resetForm = () => {
    formRef.current?.reset();
    setPasswordPreview('');
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const imageInput = form.elements.namedItem('image');
    const imageFromInput =
      imageInput instanceof HTMLInputElement ? imageInput.files?.[0] : undefined;
    const imageFromFormData = formData.get('image');
    const imageFile =
      imageFromInput ?? (imageFromFormData instanceof File ? imageFromFormData : undefined);

    let imageBase64 = '';
    const nextErrors: Record<string, string> = {};

    if (!imageFile || imageFile.size === 0) {
      nextErrors.image = 'Image is required';
    } else {
      const imageError = validateImageFile(imageFile);
      if (imageError) {
        nextErrors.image = imageError;
      } else {
        try {
          imageBase64 = await fileToBase64(imageFile);
        } catch {
          nextErrors.image = 'Failed to process image';
        }
      }
    }

    const acceptTermsRaw = formData.get('acceptTerms');
    const acceptTerms = acceptTermsRaw === 'on' || acceptTermsRaw === 'true';

    const ageRaw = formData.get('age');
    const ageValue = typeof ageRaw === 'string' ? ageRaw : '';

    const parsed = formSchema.safeParse({
      name: formData.get('name'),
      age: ageValue === '' ? Number.NaN : Number(ageValue),
      email: formData.get('email'),
      gender: formData.get('gender'),
      acceptTerms,
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      country: formData.get('country'),
      imageBase64,
    });

    if (!parsed.success) {
      Object.assign(nextErrors, formatZodErrors(parsed.error));
      setErrors(nextErrors);
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    addSubmission({
      formType: 'uncontrolled',
      ...parsed.data,
    });

    resetForm();
    onSuccess();
  };

  return (
    <form
      ref={formRef}
      className="profile-form"
      onSubmit={handleSubmit}
      noValidate
      data-testid="uncontrolled-form"
    >
      <div className="form-field">
        <label htmlFor="uc-name">Name</label>
        <input
          id="uc-name"
          name="name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
        />
        <FormFieldError message={errors.name} />
      </div>

      <div className="form-field">
        <label htmlFor="uc-age">Age</label>
        <input id="uc-age" name="age" type="number" min="0" aria-invalid={Boolean(errors.age)} />
        <FormFieldError message={errors.age} />
      </div>

      <div className="form-field">
        <label htmlFor="uc-email">Email</label>
        <input
          id="uc-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        <FormFieldError message={errors.email} />
      </div>

      <fieldset className="form-field">
        <legend>Gender</legend>
        <div className="gender-options" role="radiogroup" aria-label="Gender">
          <label htmlFor="uc-gender-male">
            <input id="uc-gender-male" name="gender" type="radio" value="Male" />
            Male
          </label>
          <label htmlFor="uc-gender-female">
            <input id="uc-gender-female" name="gender" type="radio" value="Female" />
            Female
          </label>
          <label htmlFor="uc-gender-other">
            <input id="uc-gender-other" name="gender" type="radio" value="Other" />
            Other
          </label>
        </div>
        <FormFieldError message={errors.gender} />
      </fieldset>

      <div className="form-field">
        <label htmlFor="uc-password">Password</label>
        <input
          id="uc-password"
          name="password"
          type="password"
          autoComplete="new-password"
          onChange={(event) => setPasswordPreview(event.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        <PasswordStrength password={passwordPreview} />
        <FormFieldError message={errors.password} />
      </div>

      <div className="form-field">
        <label htmlFor="uc-confirm-password">Confirm password</label>
        <input
          id="uc-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        <FormFieldError message={errors.confirmPassword} />
      </div>

      <CountryAutocomplete id="uc-country" name="country" error={errors.country} />

      <div className="form-field">
        <label htmlFor="uc-image">Profile image (PNG or JPEG, max 5MB)</label>
        <input
          id="uc-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg"
          aria-invalid={Boolean(errors.image)}
        />
        <FormFieldError message={errors.image} />
      </div>

      <div className="form-field form-field--inline">
        <input id="uc-terms" name="acceptTerms" type="checkbox" />
        <label htmlFor="uc-terms">I accept the Terms and Conditions</label>
      </div>
      <FormFieldError message={errors.acceptTerms} />

      <div className="form-actions">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
