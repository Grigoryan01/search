import { describe, expect, it } from 'vitest';

import { getCountryInputValueProps } from './countryInputProps';

describe('getCountryInputValueProps', () => {
  it('returns controlled value props when value is provided', () => {
    expect(getCountryInputValueProps('Canada')).toEqual({ value: 'Canada' });
  });

  it('returns defaultValue props when only defaultValue is provided', () => {
    expect(getCountryInputValueProps(undefined, 'Germany')).toEqual({
      defaultValue: 'Germany',
    });
  });
});
