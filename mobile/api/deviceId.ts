import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "caremap_device_user_id";
let cachedUserId: string | null = null;

function generateDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `dev-${timePart}-${randomPart}`;
}

async function readStoredId(): Promise<string | null> {
  try {
    const available = await SecureStore.isAvailableAsync();
    if (!available) return null;

    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    return stored ?? null;
  } catch (error) {
    console.warn("Could not read device ID from secure storage", error);
    return null;
  }
}

async function persistId(userId: string): Promise<void> {
  try {
    const available = await SecureStore.isAvailableAsync();
    if (!available) return;

    await SecureStore.setItemAsync(STORAGE_KEY, userId);
  } catch (error) {
    console.warn("Could not persist device ID to secure storage", error);
  }
}

export async function getDeviceUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  const stored = await readStoredId();
  if (stored) {
    cachedUserId = stored;
    return stored;
  }

  const newId = generateDeviceId();
  await persistId(newId);
  cachedUserId = newId;
  return newId;
}

export async function withDeviceIdHeader(
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  const userId = await getDeviceUserId();
  return { ...headers, "X-Device-Id": userId };
}
