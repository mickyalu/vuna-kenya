import { safeWindow } from './runtime'

const mem = new Map<string, string>()

function memoryStore() {
  return {
    getItem(key: string) {
      return mem.get(key) ?? null
    },
    setItem(key: string, value: string) {
      mem.set(key, value)
    },
    removeItem(key: string) {
      mem.delete(key)
    },
    keys() {
      return [...mem.keys()]
    },
  }
}

function nativeStore() {
  const w = safeWindow()
  try {
    if (w?.localStorage) return w.localStorage
  } catch {
    /* Mini App / private mode */
  }
  return null
}

function store() {
  return nativeStore() ?? memoryStore()
}

export function readStore(key: string): string | null {
  try {
    return store().getItem(key)
  } catch {
    return mem.get(key) ?? null
  }
}

export function writeStore(key: string, value: string) {
  try {
    store().setItem(key, value)
  } catch {
    mem.set(key, value)
  }
}

export function removeStore(key: string) {
  try {
    store().removeItem(key)
  } catch {
    mem.delete(key)
  }
  mem.delete(key)
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

export function writeJson(key: string, value: unknown) {
  writeStore(key, JSON.stringify(value))
}

export function clearVunaStore() {
  const native = nativeStore()
  try {
    if (native) {
      const keys: string[] = []
      for (let i = 0; i < native.length; i += 1) {
        const key = native.key(i)
        if (key?.startsWith('vuna-')) keys.push(key)
      }
      for (const key of keys) native.removeItem(key)
    }
  } catch {
    /* blocked */
  }
  for (const key of [...mem.keys()]) {
    if (key.startsWith('vuna-')) mem.delete(key)
  }
}
