import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty string when key is missing', () => {
    const { result } = renderHook(() => useLocalStorage('testKey'));

    expect(result.current.storedValue).toBe('');
  });

  it('reads trimmed value from localStorage on init', () => {
    localStorage.setItem('testKey', '  hello  ');
    const { result } = renderHook(() => useLocalStorage('testKey'));

    expect(result.current.storedValue).toBe('hello');
  });

  it('persists value via setValue', () => {
    const { result } = renderHook(() => useLocalStorage('testKey'));

    act(() => {
      result.current.setValue('saved');
    });

    expect(result.current.storedValue).toBe('saved');
    expect(localStorage.getItem('testKey')).toBe('saved');
  });

  it('reads current value via getValue', () => {
    localStorage.setItem('testKey', 'from-storage');
    const { result } = renderHook(() => useLocalStorage('testKey'));

    expect(result.current.getValue()).toBe('from-storage');
  });
});
