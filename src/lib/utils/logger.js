/**
 * Environment-aware logging utility
 * Only logs in development mode
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Group logs together (dev only)
   */
  group: (label, callback) => {
    if (isDev) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },
};
