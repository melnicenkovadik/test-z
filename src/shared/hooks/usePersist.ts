import { useCallback, useState } from "react";

interface UsePersistProps<T> {
  initialValue: T;
  stateName: string;
}

export const usePersist = <T>({
  stateName,
  initialValue,
}: UsePersistProps<T>): [T, (value: T) => void] => {
  const name = `persist/${stateName}`;

  const getFromStorage = <Tv>(nameItem: string, defaultValue: Tv) => {
    try {
      const storedString = localStorage.getItem(nameItem);
      if (storedString === null) {
        localStorage.setItem(name, JSON.stringify(defaultValue));
        return defaultValue;
      }
      const val = JSON.parse(storedString) as Tv;
      return val;
    } catch {
      return defaultValue;
    }
  };

  const [state, setState] = useState<T>(getFromStorage<T>(name, initialValue));

  const setValue = useCallback(
    (value: T) => {
      localStorage.setItem(name, JSON.stringify(value));
      setState(value);
    },
    [name],
  );

  return [state, setValue];
};
