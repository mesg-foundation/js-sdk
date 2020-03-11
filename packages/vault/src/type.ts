export interface Store {
  set(key: string, value: string): void;
  get(key: string): string;
  keys(): string[];
}