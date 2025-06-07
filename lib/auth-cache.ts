// Simple in-memory cache for profile data
class ProfileCache {
  private cache = new Map<string, { profile: any; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

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

export const profileCache = new ProfileCache()
