// app/lib/cards.ts
// Central cards index & helpers for the MVP (no backend).
// Assumes the dataset lives at app/data/cards.json

// If your tsconfig doesn't already allow JSON imports, ensure:
// "resolveJsonModule": true, "esModuleInterop": true

// ---- Types you use across the app ----
// Import the bundled dataset (copy of backend/data/cards_processed.json)
  import RAW from "../app/data/cards.json";
  
  export type Card = {
    id: string;
    name: string;
    setId: string;
    setName: string;
    rarity: string;
    image: string;   // URL to large/hires if available; small fallback
  };
  
  // The dataset can be in a few shapes; we keep it loose here.
  type RawCard = any;
  
  // ---- Normalizer: convert a raw dataset row into a Card or null ----
  function toCard(raw: RawCard): Card | null {
    if (!raw) return null;
  
    // id
    const idRaw = raw.id ?? raw.cardId ?? raw.card_id ?? raw.number;
    if (idRaw == null) return null;
    const id = String(idRaw);
  
    // name
    const name =
      raw.name ?? raw.cardName ?? raw.card_name ?? raw.title ?? "Unknown";
  
    // set info
    const setObj = raw.set ?? raw.Set ?? {};
    const setId =
      setObj.id ?? raw.setId ?? raw.set_id ?? setObj.code ?? "unknown";
    const setName =
      setObj.name ?? raw.setName ?? raw.set_name ?? "Unknown Set";
  
    // rarity
    const rarity =
      raw.rarity ?? raw.cardRarity ?? raw.card_rarity ?? "Unknown";
  
    // image (prefer large/hires)
    const image =
      raw.images?.large ??
      raw.images?.hires ??
      raw.imageUrlHiRes ??
      raw.imageUrl ??
      raw.images?.small ??
      raw.image ??
      "";
  
    // Require image & basic fields for UI tiles
    if (!name || !setId || !setName) return null;
  
    return { id, name, setId: String(setId), setName: String(setName), rarity, image };
  }
  
  // ---- Build indices once at module load ----
  const RAW_LIST: RawCard[] = Array.isArray((RAW as any)?.data)
    ? (RAW as any).data
    : (Array.isArray(RAW) ? (RAW as RawCard[]) : []);
  
  const ALL: Card[] = RAW_LIST.map(toCard).filter((x): x is Card => x !== null);
  
  const BY_ID: Record<string, Card> = {};
  for (const c of ALL) BY_ID[c.id] = c;
  
  const BY_SET: Record<string, Card[]> = {};
  for (const c of ALL) {
    if (!BY_SET[c.setId]) BY_SET[c.setId] = [];
    BY_SET[c.setId].push(c);
  }
  
  // ---- Public helpers ----
  export function getAllCards(): Card[] {
    return ALL;
  }
  
  export function getCardById(id: string): Card | undefined {
    return BY_ID[id];
  }
  
  export function getCardsBySetId(setId: string): Card[] {
    return BY_SET[setId] ?? [];
  }
  
  // Simple RNG helpers (used for “open pack” in Profile)
  export function pickRandom<T>(arr: T[], n: number): T[] {
    if (n <= 0 || arr.length === 0) return [];
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, Math.min(n, a.length));
  }
  
  // Convenience: open `count` cards from a set (uniform random for MVP)
  export function openFromSet(setId: string, count: number): Card[] {
    return pickRandom(getCardsBySetId(setId), Math.max(0, count));
  }
  
  // Optional: quick rarity bucket (useful for filters)
  export function bucketByRarity(cards: Card[]): Record<string, Card[]> {
    return cards.reduce<Record<string, Card[]>>((acc, c) => {
      (acc[c.rarity] ??= []).push(c);
      return acc;
    }, {});
  }
  