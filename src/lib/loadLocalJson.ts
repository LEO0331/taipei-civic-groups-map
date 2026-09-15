export class LocalDataLoadError extends Error {
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = 'LocalDataLoadError';
  }
}

export async function loadLocalJson<T>(path: string): Promise<T> {
  const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new LocalDataLoadError(path, `HTTP ${response.status}`);

  try {
    return await response.json() as T;
  } catch {
    throw new LocalDataLoadError(path, 'response is not valid JSON');
  }
}
