const STORAGE_KEY = 'm1n-command-usage';

let usageData = null;

function normalizeEntry(entry) {
  if (typeof entry === 'number') {
    return { count: entry, lastUsed: 0 };
  }

  if (entry && typeof entry === 'object') {
    return {
      count: Number.isFinite(entry.count) ? entry.count : 0,
      lastUsed: Number.isFinite(entry.lastUsed) ? entry.lastUsed : 0,
    };
  }

  return { count: 0, lastUsed: 0 };
}

function normalizeUsageData(data) {
  return Object.fromEntries(
    Object.entries(data || {}).map(([commandKey, entry]) => [
      commandKey,
      normalizeEntry(entry),
    ])
  );
}

function loadUsageData() {
  if (usageData !== null) return usageData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    usageData = normalizeUsageData(stored ? JSON.parse(stored) : {});
  } catch {
    usageData = {};
  }
  return usageData;
}

function saveUsageData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usageData));
  } catch {
    // Silently fail if storage is unavailable
  }
}

export const UsageTracker = {
  recordUsage(commandKey) {
    const data = loadUsageData();
    const current = normalizeEntry(data[commandKey]);
    data[commandKey] = {
      count: current.count + 1,
      lastUsed: Date.now(),
    };
    saveUsageData();
  },

  getUsageCount(commandKey) {
    const data = loadUsageData();
    return normalizeEntry(data[commandKey]).count;
  },

  getLastUsed(commandKey) {
    const data = loadUsageData();
    return normalizeEntry(data[commandKey]).lastUsed;
  },

  getRecentCommands(commandKeys, limit = 4) {
    const data = loadUsageData();

    return [...commandKeys]
      .map((commandKey) => ({
        commandKey,
        ...normalizeEntry(data[commandKey]),
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => {
        if (b.lastUsed !== a.lastUsed) return b.lastUsed - a.lastUsed;
        return b.count - a.count;
      })
      .slice(0, limit);
  },

  getFrequentCommands(commandKeys, limit = 4) {
    const data = loadUsageData();

    return [...commandKeys]
      .map((commandKey) => ({
        commandKey,
        ...normalizeEntry(data[commandKey]),
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.lastUsed - a.lastUsed;
      })
      .slice(0, limit);
  },

  resetUsage(commandKey = null) {
    const data = loadUsageData();
    if (commandKey) {
      delete data[commandKey];
    } else {
      usageData = {};
    }
    saveUsageData();
  },
};
