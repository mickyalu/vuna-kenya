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
