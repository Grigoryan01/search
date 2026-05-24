import { useCallback, useState } from 'react';

export const useLocalStorage = (key: string) => {
  const [storedValue, setStoredValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw?.trim() ?? '';
  });

  const setValue = useCallback(
    (value: string) => {
      localStorage.setItem(key, value);
      setStoredValue(value);
    },
    [key]
  );

  const getValue = useCallback(() => {
    const raw = localStorage.getItem(key);
    return raw?.trim() ?? '';
  }, [key]);

  return { storedValue, setValue, getValue };
};
