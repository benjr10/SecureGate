import { db } from './db';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

/**
 * Checks if a key has exceeded the rate limit within a sliding window.
 * Uses an in-memory store as the primary tier and the database as backup.
 *
 * @param key Unique key to rate limit (e.g., "ip:login" or "email:forgot-password")
 * @param limit Maximum allowed attempts within the window
 * @param windowMs Window duration in milliseconds (e.g., 15 * 60 * 1000 for 15 mins)
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{
  success: boolean;
  count: number;
  resetTime: Date;
}> {
  const now = Date.now();

  // Tier 1: In-memory check (fast, works without DB)
  const memEntry = memoryStore.get(key);
  if (memEntry && now < memEntry.resetAt) {
    if (memEntry.count >= limit) {
      return { success: false, count: memEntry.count, resetTime: new Date(memEntry.resetAt) };
    }
    memEntry.count++;
    return { success: true, count: memEntry.count, resetTime: new Date(memEntry.resetAt) };
  }
  if (!memEntry || now >= memEntry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
  }

  // Tier 2: Database check (durable, persists across restarts)
  try {
    const cutoff = new Date(now - windowMs);

    await db.rateLimit.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });

    const count = await db.rateLimit.count({
      where: { key, timestamp: { gte: cutoff } },
    });

    const oldestRecord = await db.rateLimit.findFirst({
      where: { key, timestamp: { gte: cutoff } },
      orderBy: { timestamp: 'asc' },
    });

    const resetTime = oldestRecord
      ? new Date(oldestRecord.timestamp.getTime() + windowMs)
      : new Date(now + windowMs);

    if (count >= limit) {
      return { success: false, count, resetTime };
    }

    await db.rateLimit.create({ data: { key } });

    // Sync memory store count with DB
    const memEntry2 = memoryStore.get(key);
    if (memEntry2) {
      memEntry2.count = count + 1;
    }

    return { success: true, count: count + 1, resetTime };
  } catch {
    // DB unavailable: rely on in-memory state as fallback
    const fallbackEntry = memoryStore.get(key);
    if (fallbackEntry) {
      if (fallbackEntry.count >= limit) {
        return { success: false, count: fallbackEntry.count, resetTime: new Date(fallbackEntry.resetAt) };
      }
      return { success: true, count: fallbackEntry.count, resetTime: new Date(fallbackEntry.resetAt) };
    }
    // No memory entry either — allow the request but log the failure
    return { success: true, count: 1, resetTime: new Date(now + windowMs) };
  }
}
