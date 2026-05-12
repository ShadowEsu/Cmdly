import crypto from "crypto";

// Per-UID daily quotas — in-memory, resets on server restart or UTC day rollover.
interface DayUsage {
  analyses: number;
  images: number;
  bytes: number;
  dayKey: string; // "YYYY-MM-DD"
}

const quotaMap = new Map<string, DayUsage>();

const LIMITS = {
  analyses: 20,
  images: 60,
  bytes: 200 * 1024 * 1024 // 200 MB
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(uid: string): DayUsage {
  const today = todayKey();
  let u = quotaMap.get(uid);
  if (!u || u.dayKey !== today) {
    u = { analyses: 0, images: 0, bytes: 0, dayKey: today };
    quotaMap.set(uid, u);
  }
  return u;
}

export const quotaStore = {
  check(uid: string, imageCnt: number, payloadBytes: number): { allowed: boolean; reason?: string } {
    const u = getUsage(uid);
    if (u.analyses >= LIMITS.analyses)
      return { allowed: false, reason: `Daily analysis limit reached (${LIMITS.analyses}/day). Try again tomorrow.` };
    if (u.images + imageCnt > LIMITS.images)
      return { allowed: false, reason: `Daily image limit reached (${LIMITS.images}/day). Try again tomorrow.` };
    if (u.bytes + payloadBytes > LIMITS.bytes)
      return { allowed: false, reason: "Daily data limit reached. Try again tomorrow." };
    return { allowed: true };
  },
  consume(uid: string, imageCnt: number, payloadBytes: number): void {
    const u = getUsage(uid);
    u.analyses += 1;
    u.images += imageCnt;
    u.bytes += payloadBytes;
  },
  usage(uid: string): DayUsage {
    return getUsage(uid);
  }
};

// Content-hash → result cache (24h TTL)
interface CacheEntry {
  result: unknown;
  createdAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const resultCache = new Map<string, CacheEntry>();

function pruneCache(): void {
  const now = Date.now();
  for (const [k, v] of resultCache) {
    if (now - v.createdAt > CACHE_TTL_MS) resultCache.delete(k);
  }
}

export function hashRequestBody(body: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export const contentCache = {
  get(hash: string): unknown | undefined {
    const entry = resultCache.get(hash);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      resultCache.delete(hash);
      return undefined;
    }
    return entry.result;
  },
  set(hash: string, result: unknown): void {
    pruneCache();
    resultCache.set(hash, { result, createdAt: Date.now() });
  }
};
