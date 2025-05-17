import { browser } from "@wxt-dev/browser";

export async function getLocalStorage<T>(key: string): Promise<T | undefined> {
  const result = await browser.storage.local.get(key);
  return result[key];
}

export async function setLocalStorage<T>(key: string, value: T): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}

export function makeLocalStorage<T>(key: string) {
  return {
    get: async () => {
      const result = await getLocalStorage<T>(key);
      return result;
    },
    set: async (value: T) => {
      await setLocalStorage(key, value);
    },
    remove: async () => {
      await browser.storage.local.remove(key);
    },
  };
}
