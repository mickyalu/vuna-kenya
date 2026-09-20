export function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode / blocked storage */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStore(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function clearVunaStore() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('vuna-'))
    for (const key of keys) localStorage.removeItem(key)
  } catch {
    /* blocked */
  }
}
