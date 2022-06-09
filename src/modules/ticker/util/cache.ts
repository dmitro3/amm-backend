export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl: number): Promise<T>;
  // eslint-disable-next-line
  mSet(data: { key: string; value: any; ttl: number }[]): Promise<void>;
}
