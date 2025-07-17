/**
 * Production-safe logging utilities
 * Only logs in development environment to avoid console clutter in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  // Debug logs only in development
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  // Info logs only in development  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  // Warning logs always (but silent in production)
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  // Error logs always (important for debugging issues)
  error: (...args: any[]) => {
    console.error(...args)
  },

  // Critical logs always (for production monitoring)
  critical: (...args: any[]) => {
    console.error('[CRITICAL]', ...args)
  }
}

export default logger
