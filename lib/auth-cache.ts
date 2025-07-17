// Simple in-memory cache for profile data
class ProfileCache {
  private cache = new Map<string, { profile: any; timestamp: number }>()
  private readonly TTL = 15 * 60 * 1000 // 15 minutes (increased from 5)

  set(userId: string, profile: any) {
    this.cache.set(userId, {
      profile,
      timestamp: Date.now(),
    })
  }

  get(userId: string) {
    const cached = this.cache.get(userId)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(userId)
      return null
    }

    return cached.profile
  }

  clear(userId?: string) {
    if (userId) {
      this.cache.delete(userId)
    } else {
      this.cache.clear()
    }
  }
}

// Session cache to reduce auth state checks
class SessionCache {
  private sessionData: { session: any; timestamp: number } | null = null
  private readonly TTL = 10 * 60 * 1000 // 10 minutes

  set(session: any) {
    this.sessionData = {
      session,
      timestamp: Date.now(),
    }
  }

  get() {
    if (!this.sessionData) return null

    if (Date.now() - this.sessionData.timestamp > this.TTL) {
      this.sessionData = null
      return null
    }

    return this.sessionData.session
  }

  clear() {
    this.sessionData = null
  }
}

export const profileCache = new ProfileCache()
export const sessionCache = new SessionCache()
