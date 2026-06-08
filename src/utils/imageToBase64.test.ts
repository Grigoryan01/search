import { describe, expect, it } from 'vitest';

import { validateImageFile, IMAGE_VALIDATION } from './imageToBase64';

describe('validateImageFile', () => {
  it('accepts allowed image types within size limit', () => {
    const file = new File(['abc'], 'photo.png', { type: 'image/png' });
    expect(validateImageFile(file)).toBeNull();
  });

  it('rejects unsupported file types', () => {
    const file = new File(['abc'], 'photo.gif', { type: 'image/gif' });
    expect(validateImageFile(file)).toBe('Image must be PNG or JPEG');
  });

  it('rejects files larger than the max size', () => {
    const largeContent = new Uint8Array(IMAGE_VALIDATION.maxSizeBytes + 1);
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(file)).toBe('Image must be smaller than 5MB');
  });
});
