/**
 * Storage Monitoring Utilities
 * Helps track and manage localStorage usage
 */

/**
 * Get overall localStorage usage statistics
 */
export function getStorageUsage() {
  let total = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }

  // Assume 5MB quota (conservative estimate, some browsers allow 10MB)
  const quotaBytes = 5 * 1024 * 1024;

  return {
    usedBytes: total,
    usedKB: (total / 1024).toFixed(2),
    usedMB: (total / 1024 / 1024).toFixed(2),
    quotaBytes,
    quotaMB: (quotaBytes / 1024 / 1024).toFixed(2),
    percentUsed: ((total / quotaBytes) * 100).toFixed(1),
    remaining: quotaBytes - total,
    remainingMB: ((quotaBytes - total) / 1024 / 1024).toFixed(2)
  };
}

/**
 * Get detailed breakdown of vendor-specific storage
 */
export function getVendorStorageBreakdown() {
  const breakdown = {};
  const vendorKeys = Object.keys(localStorage).filter(k =>
    k.startsWith('vendor_')
  );

  let total = 0;

  vendorKeys.forEach(key => {
    const size = localStorage[key].length;
    total += size;
    breakdown[key] = {
      sizeBytes: size,
      sizeKB: (size / 1024).toFixed(2),
      sizeMB: (size / 1024 / 1024).toFixed(2)
    };
  });

  return {
    breakdown,
    total: {
      sizeBytes: total,
      sizeKB: (total / 1024).toFixed(2),
      sizeMB: (total / 1024 / 1024).toFixed(2)
    }
  };
}

/**
 * Check if storage is near the quota limit
 * @param {number} thresholdPercent - Percentage threshold (default 80%)
 */
export function isStorageNearLimit(thresholdPercent = 80) {
  const { percentUsed } = getStorageUsage();
  return parseFloat(percentUsed) > thresholdPercent;
}

/**
 * Clear all vendor registration data from localStorage
 */
export function clearAllVendorStorage() {
  const keys = [
    'vendor_profile_image',
    'vendor_business_license',
    'vendor_logo',
    'vendor_banner',
    'vendor_registration_form_state'
  ];

  let cleared = 0;
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleared++;
    }
  });

  return {
    cleared,
    message: `Cleared ${cleared} vendor storage items`
  };
}

/**
 * Get the largest items in localStorage
 * @param {number} limit - Number of items to return
 */
export function getLargestStorageItems(limit = 5) {
  const items = [];

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length;
      items.push({
        key,
        sizeBytes: size,
        sizeKB: (size / 1024).toFixed(2),
        sizeMB: (size / 1024 / 1024).toFixed(2)
      });
    }
  }

  return items.sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, limit);
}

/**
 * Estimate how much data can still be saved
 * @param {number} dataSize - Size in bytes of data to save
 */
export function canSaveData(dataSize) {
  const { remaining } = getStorageUsage();
  return {
    canSave: remaining > dataSize,
    available: remaining,
    needed: dataSize,
    shortfall: Math.max(0, dataSize - remaining)
  };
}

/**
 * Development helper: Add to window object for debugging
 */
export function installStorageDebugTools() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  window.storageDebug = {
    usage: getStorageUsage,
    vendorBreakdown: getVendorStorageBreakdown,
    largest: getLargestStorageItems,
    clearVendor: clearAllVendorStorage,
    isNearLimit: isStorageNearLimit,

    // Pretty print usage
    printUsage: () => {
      const usage = getStorageUsage();
      console.log(`
📊 localStorage Usage:
  Used: ${usage.usedMB} MB / ${usage.quotaMB} MB (${usage.percentUsed}%)
  Remaining: ${usage.remainingMB} MB
      `);
    },

    // Pretty print vendor breakdown
    printVendor: () => {
      const { breakdown, total } = getVendorStorageBreakdown();
      console.log('📦 Vendor Storage Breakdown:');
      console.table(breakdown);
      console.log(`Total Vendor Data: ${total.sizeMB} MB`);
    },

    // Pretty print largest items
    printLargest: (limit = 5) => {
      const items = getLargestStorageItems(limit);
      console.log(`📈 Top ${limit} Largest Items:`);
      console.table(items);
    }
  };

  console.log('🔧 Storage debug tools installed:');
  console.log('  - storageDebug.printUsage()');
  console.log('  - storageDebug.printVendor()');
  console.log('  - storageDebug.printLargest()');
  console.log('  - storageDebug.clearVendor()');
}
