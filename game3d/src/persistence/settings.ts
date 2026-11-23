import type { StoragePort } from "./save.ts";

export const SETTINGS_KEY = "av-tech-rpg-3d-settings-v1";
export const graphicsPresets = {
  high: { label: "High", resolution: 1, shadowSize: 2048, filteredShadows: true },
  balanced: { label: "Balanced", resolution: 0.85, shadowSize: 1024, filteredShadows: true },
  low: { label: "Low", resolution: 0.65, shadowSize: 512, filteredShadows: false },
} as const;
export type GraphicsQuality = keyof typeof graphicsPresets;
export interface Settings { version: 1; quality: GraphicsQuality; sensitivity: number }
export const defaultSettings = (): Settings => ({ version: 1, quality: "high", sensitivity: 1 });

export class SettingsRepository {
  private writable = true;
  private storage: StoragePort;
  constructor(storage: StoragePort) { this.storage = storage; }
  load(): Settings {
    try {
      const raw = this.storage.getItem(SETTINGS_KEY);
      if (!raw) return defaultSettings();
      const data = JSON.parse(raw) as Settings;
      if (data.version !== 1 || typeof data.quality !== "string" || !Object.hasOwn(graphicsPresets, data.quality) ||
        typeof data.sensitivity !== "number" || !Number.isFinite(data.sensitivity) || data.sensitivity < 0.4 || data.sensitivity > 2) throw new Error("Invalid settings");
      return { version: 1, quality: data.quality, sensitivity: data.sensitivity };
    } catch { this.writable = false; return defaultSettings(); }
  }
  save(data: Settings) {
    if (!this.writable) return false;
    try { this.storage.setItem(SETTINGS_KEY, JSON.stringify(data)); return true; }
    catch { this.writable = false; return false; }
  }
}
