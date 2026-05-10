import { GameState } from "../data/dialogs.js";
import { Inventory } from "./Inventory.js";

const STORAGE_KEY = "maki:save:v1";
const SAVE_INTERVAL_MS = 300;

const DEFAULT_GAME_STATE = {
  ...GameState,
  dadPosition: { ...GameState.dadPosition },
};

export class Persistence {
  static _lastSaveAt = 0;
  static _cachedSave = null;

  static _hasStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  static loadSave() {
    if (this._cachedSave) return this._cachedSave;
    if (!this._hasStorage()) return null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      this._cachedSave = parsed;
      return parsed;
    } catch (error) {
      console.warn("Failed to read save data:", error);
      return null;
    }
  }

  static hydrateRuntimeState() {
    const save = this.loadSave();
    if (!save) return;

    const savedGameState = save.gameState || {};
    for (const [key, defaultValue] of Object.entries(DEFAULT_GAME_STATE)) {
      if (Object.prototype.hasOwnProperty.call(savedGameState, key)) {
        if (key === "dadPosition" && savedGameState.dadPosition) {
          GameState.dadPosition = { ...savedGameState.dadPosition };
        } else {
          GameState[key] = savedGameState[key];
        }
      } else {
        GameState[key] = key === "dadPosition" ? { ...defaultValue } : defaultValue;
      }
    }

    Inventory.items = Array.isArray(save.inventory) ? [...save.inventory] : [];
  }

  static getSavedSceneKey() {
    const save = this.loadSave();
    return save?.scene?.key || null;
  }

  static applySavedPlayerState(sceneKey, player) {
    const save = this.loadSave();
    const sceneState = save?.scene;
    if (!sceneState || sceneState.key !== sceneKey || !player || !player.hitbox) {
      return false;
    }

    const x = Number(sceneState.playerX);
    const y = Number(sceneState.playerY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

    player.x = x;
    player.y = y;
    player.hitbox.x = x;
    player.hitbox.y = y;
    player.setFlipX(Boolean(sceneState.flipX));
    return true;
  }

  static saveSceneState(sceneKey, player) {
    if (!this._hasStorage() || !player || !player.hitbox) return;

    const now = Date.now();
    if (now - this._lastSaveAt < SAVE_INTERVAL_MS) return;
    this._lastSaveAt = now;

    const payload = {
      scene: {
        key: sceneKey,
        playerX: player.x,
        playerY: player.y,
        flipX: player.flipX,
      },
      gameState: {
        ...GameState,
        dadPosition: { ...GameState.dadPosition },
      },
      inventory: [...Inventory.items],
      savedAt: now,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this._cachedSave = payload;
    } catch (error) {
      console.warn("Failed to save game state:", error);
    }
  }

  static clearSceneState(sceneKey) {
    const save = this.loadSave();
    if (!save || save?.scene?.key !== sceneKey) return;

    const payload = {
      ...save,
      scene: null,
      savedAt: Date.now(),
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this._cachedSave = payload;
    } catch (error) {
      console.warn("Failed to clear scene save data:", error);
    }
  }
}
