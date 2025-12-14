import { BotConfig } from "./bot.types";

const STORAGE_KEY = "bots";

/** Lấy toàn bộ bot */
export function getBots(): BotConfig[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

/** Lưu 1 bot mới */
export function saveBot(bot: BotConfig) {
  const bots = getBots();
  bots.push(bot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
}

/** Lấy bot theo id */
export function getBotById(id: string): BotConfig | undefined {
  return getBots().find((b) => b.id === id);
}

/** Cập nhật bot */
export function updateBot(updatedBot: BotConfig) {
  const bots = getBots().map((b) =>
    b.id === updatedBot.id ? updatedBot : b
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
}

/** Xóa bot */
export function deleteBotById(id: string) {
  const bots = getBots().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
}
