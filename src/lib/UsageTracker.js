const STORAGE_KEY = 'm1n-command-usage';

let usageData = null;

function loadUsageData() {
  if (usageData !== null) return usageData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    usageData = stored ? JSON.parse(stored) : {};
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
    data[commandKey] = (data[commandKey] || 0) + 1;
    saveUsageData();
  },

  getUsageCount(commandKey) {
    const data = loadUsageData();
    return data[commandKey] || 0;
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
