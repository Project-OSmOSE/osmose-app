export type InputRef<T, E=string> = {
  setValue: (value: T) => void;
  setError: (error: E) => void;
  validate: () => T; // throwable
}