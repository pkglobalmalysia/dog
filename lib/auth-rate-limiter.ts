// Enhanced rate limiting utility with persistent storage and better controls
class AuthRateLimiter {
  private storageKey = 'auth_rate_limit'
  private maxAttempts = 3
  private windowMinutes = 2
  private lockoutMinutes = 5

  private getStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return null
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  private setStoredData(data: any) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch {
      // localStorage might not be available
    }
  }

  private clearStoredData() {
    try {
      localStorage.removeItem(this.storageKey)
    } catch {
      // localStorage might not be available
    }
  }

  // Check if we're currently rate limited
  isRateLimited(): { limited: boolean; remainingTime?: number; message?: string } {
    const stored = this.getStoredData()
    if (!stored) return { limited: false }

    const now = Date.now()
    
    // Check if we're in a lockout period
    if (stored.lockedUntil && now < stored.lockedUntil) {
      const remainingMs = stored.lockedUntil - now
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))
      return {
        limited: true,
        remainingTime: remainingMinutes,
        message: `Rate limited. Please wait ${remainingMinutes} minute(s) before trying again.`
      }
    }

    // Check if the window has expired
    const windowMs = this.windowMinutes * 60 * 1000
    if (stored.windowStart && (now - stored.windowStart) > windowMs) {
      // Window expired, reset
      this.clearStoredData()
      return { limited: false }
    }

    // Check if we've exceeded attempts in the current window
    if (stored.attempts >= this.maxAttempts) {
      // Start lockout
      const lockoutMs = this.lockoutMinutes * 60 * 1000
      const lockedUntil = now + lockoutMs
      
      this.setStoredData({
        ...stored,
        lockedUntil,
        attempts: stored.attempts + 1
      })
      
      return {
        limited: true,
        remainingTime: this.lockoutMinutes,
        message: `Too many login attempts. Locked out for ${this.lockoutMinutes} minutes.`
      }
    }

    return { limited: false }
  }

  // Record a login attempt
  recordAttempt(): void {
    const now = Date.now()
    const stored = this.getStoredData()
    
    if (!stored || (stored.windowStart && (now - stored.windowStart) > (this.windowMinutes * 60 * 1000))) {
      // Start new window
      this.setStoredData({
        windowStart: now,
        attempts: 1,
        lastAttempt: now
      })
    } else {
      // Increment in current window
      this.setStoredData({
        ...stored,
        attempts: stored.attempts + 1,
        lastAttempt: now
      })
    }
  }

  // Record a successful login (clears rate limiting)
  recordSuccess(): void {
    this.clearStoredData()
  }

  // Record a Supabase rate limit error (immediate lockout)
  recordSupabaseRateLimit(): void {
    const now = Date.now()
    const lockoutMs = 10 * 60 * 1000 // 10 minutes for Supabase rate limit
    
    this.setStoredData({
      windowStart: now,
      attempts: this.maxAttempts + 1,
      lastAttempt: now,
      lockedUntil: now + lockoutMs,
      supabaseRateLimit: true
    })
  }

  // Get current status
  getStatus(): { attempts: number; windowStart?: number; lockedUntil?: number } {
    const stored = this.getStoredData()
    return stored || { attempts: 0 }
  }

  // Force reset (admin function)
  reset(): void {
    this.clearStoredData()
  }
}

export const authRateLimiter = new AuthRateLimiter()
