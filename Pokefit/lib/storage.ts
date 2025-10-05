import AsyncStorage from "@react-native-async-storage/async-storage";

/** Storage keys */
const K_USER = "PF_USER";
const K_STEPS = "PF_STEPS";
const K_COLLECTION = "PF_COLLECTION";

/** Types */
export type StoredUser = {
  id: string;
  name: string;
  coins: number;     // optional currency if you want to use it
};

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** ---------------- USER ---------------- */

export async function getUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(K_USER);
  return parseJSON<StoredUser | null>(raw, null);
}

export async function setUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(K_USER, JSON.stringify(user));
}

export async function updateUser(partial: Partial<StoredUser>): Promise<StoredUser> {
  const current = (await getUser()) ?? { id: "demo", name: "Ash Ketchum", coins: 1200 };
  const next = { ...current, ...partial };
  await setUser(next);
  return next;
}

/** ---------------- STEPS (all-time) ---------------- */

export async function getSteps(): Promise<number> {
  const raw = await AsyncStorage.getItem(K_STEPS);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function setSteps(total: number): Promise<void> {
  const safe = Math.max(0, Math.floor(Number(total) || 0));
  await AsyncStorage.setItem(K_STEPS, String(safe));
}

/** Add steps and return the new total */
export async function addSteps(delta: number): Promise<number> {
  const cur = await getSteps();
  const next = Math.max(0, Math.floor(cur + (Number(delta) || 0)));
  await setSteps(next);
  return next;
}

/** ---------------- COLLECTION ---------------- */

export async function getCollection(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(K_COLLECTION);
  return parseJSON<string[]>(raw, []);
}

export async function setCollection(ids: string[]): Promise<void> {
  // De-dupe and keep order of first appearance
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const id of ids) {
    if (typeof id === "string" && id && !seen.has(id)) {
      seen.add(id);
      deduped.push(id);
    }
  }
  await AsyncStorage.setItem(K_COLLECTION, JSON.stringify(deduped));
}

/** Add one or many card IDs to collection */
export async function addToCollection(ids: string[] | string): Promise<string[]> {
  const addList = Array.isArray(ids) ? ids : [ids];
  const cur = await getCollection();
  const next = [...cur, ...addList];
  await setCollection(next);
  return next;
}

/** Remove a specific card ID (all occurrences) */
export async function removeFromCollection(id: string): Promise<string[]> {
  const cur = await getCollection();
  const next = cur.filter((x) => x !== id);
  await setCollection(next);
  return next;
}

/** Clear entire collection */
export async function clearCollection(): Promise<void> {
  await AsyncStorage.setItem(K_COLLECTION, JSON.stringify([]));
}

/** ---------------- SEED (first-run defaults) ---------------- */

export async function ensureSeed(): Promise<void> {
  const [uRaw, sRaw, cRaw] = await Promise.all([
    AsyncStorage.getItem(K_USER),
    AsyncStorage.getItem(K_STEPS),
    AsyncStorage.getItem(K_COLLECTION),
  ]);

  if (!uRaw) {
    await setUser({ id: "demo", name: "Ash Ketchum", coins: 1200 });
  }
  if (sRaw == null) {
    await setSteps(0);
  }
  if (!cRaw) {
    await setCollection([]);
  }
}

/** Utility: reset everything (handy for demos) */
export async function resetAll(): Promise<void> {
  await AsyncStorage.multiRemove([K_USER, K_STEPS, K_COLLECTION]);
}
