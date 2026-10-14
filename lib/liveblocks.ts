import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#7C3AED",
  "#22C55E",
  "#F97316",
  "#EC4899",
  "#06B6D4",
  "#FACC15",
  "#8B5CF6",
  "#10B981",
  "#F43F5E",
  "#3B82F6",
];

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocksClient?: Liveblocks;
};

export function getCursorColorForUserId(userId: string) {
  const normalizedId = userId.trim();

  if (!normalizedId) {
    return CURSOR_COLORS[0];
  }

  let hash = 0;

  for (let index = 0; index < normalizedId.length; index += 1) {
    hash = normalizedId.charCodeAt(index) + ((hash << 5) - hash);
  }

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function getLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  if (!globalForLiveblocks.liveblocksClient) {
    globalForLiveblocks.liveblocksClient = new Liveblocks({ secret });
  }

  return globalForLiveblocks.liveblocksClient;
}
