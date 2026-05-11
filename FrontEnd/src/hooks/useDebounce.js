import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * ────────────────
 * Returns a debounced version of the provided value.
 * Used to delay API calls while a user is typing.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
