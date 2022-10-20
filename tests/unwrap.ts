type Optional<T> = T | undefined | null;

export function unwrap<T>(value: Optional<T>, message: string = ''): T {
  if (!value) {
    throw Error(message);
  }
  return value;
}
