export type RequiredSelected<T extends Record<any, any>, KEYS extends keyof T> = Omit<T, KEYS> &
   Required<Pick<T, KEYS>>;
