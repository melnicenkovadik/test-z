interface Props<T> {
  defaultValue: T;
  name: string;
}

export const persistValue = <T>({
  defaultValue,
  name,
}: Props<T>): [T, (value: T) => void] => {
  const key = `persistValue/${name}`;
  const getFromStorage = (storageKey: string): T | null => {
    try {
      const storedString = localStorage.getItem(storageKey);
      if (!storedString) {
        return null;
      }
      return JSON.parse(storedString) as T;
    } catch {
      return null;
    }
  };

  let storedValue: T = getFromStorage(key) || defaultValue;
  const setValue = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    storedValue = value;
  };

  return [storedValue, setValue];
};
