type ClassValue = string | number | false | null | undefined | ClassValue[] | Record<string, boolean | undefined | null>;

export const cn = (...inputs: ClassValue[]): string => {
  const classes: string[] = [];
  const visit = (input: ClassValue): void => {
    if (!input) return;
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
      return;
    }
    if (Array.isArray(input)) {
      input.forEach(visit);
      return;
    }
    Object.entries(input).forEach(([key, value]) => {
      if (value) classes.push(key);
    });
  };
  inputs.forEach(visit);
  return classes.join(' ');
};
