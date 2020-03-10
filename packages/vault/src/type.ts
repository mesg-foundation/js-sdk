export interface Store {
  setItem(key: string, value: string): void;
  getItem(key: string): string;
}