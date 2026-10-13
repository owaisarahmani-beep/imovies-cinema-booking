// Safe wrapper around localStorage that never throws SecurityError in restricted environments
export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to read ${key}:`, e.message);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to write ${key}:`, e.message);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove ${key}:`, e.message);
    }
  }
};
