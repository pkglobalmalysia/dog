// Request debouncer to prevent rapid successive API calls
export class RequestDebouncer {
  private timers = new Map<string, NodeJS.Timeout>()
  private inProgress = new Set<string>()

  // Debounce function calls by key
  debounce<T extends (...args: any[]) => Promise<any>>(
    key: string,
    fn: T,
    delay: number = 300
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return (...args) => {
      return new Promise((resolve, reject) => {
        // Clear existing timer for this key
        const existingTimer = this.timers.get(key)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        // Set new timer
        const timer = setTimeout(async () => {
          // Check if already in progress
          if (this.inProgress.has(key)) {
            console.log(`🔄 Request already in progress for key: ${key}`)
            return
          }

          try {
            this.inProgress.add(key)
            this.timers.delete(key)
            const result = await fn(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            this.inProgress.delete(key)
          }
        }, delay)

        this.timers.set(key, timer)
      })
    }
  }

  // Cancel all pending requests
  cancelAll() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.inProgress.clear()
  }

  // Cancel specific request
  cancel(key: string) {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
    this.inProgress.delete(key)
  }
}

// Global instance
export const globalDebouncer = new RequestDebouncer()
