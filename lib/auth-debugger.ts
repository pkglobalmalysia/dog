// Auth debugging utility to track login attempts and identify issues
class AuthDebugger {
  private static instance: AuthDebugger
  private logs: Array<{
    timestamp: number
    type: 'attempt' | 'success' | 'error' | 'rate_limit' | 'component_mount' | 'session_check'
    message: string
    stack?: string
    data?: any
  }> = []
  private maxLogs = 100

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger()
    }
    return AuthDebugger.instance
  }

  private constructor() {
    // Log component mounts that might be causing auth checks
    if (typeof window !== 'undefined') {
      const originalError = console.error
      console.error = (...args) => {
        if (args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('rate limit') || arg.includes('auth') || arg.includes('login'))
        )) {
          this.log('error', `Console Error: ${args.join(' ')}`, new Error().stack)
        }
        originalError.apply(console, args)
      }
    }
  }

  log(type: 'attempt' | 'success' | 'error' | 'rate_limit' | 'component_mount' | 'session_check', message: string, stack?: string, data?: any) {
    const entry = {
      timestamp: Date.now(),
      type,
      message,
      stack,
      data
    }
    
    this.logs.push(entry)
    
    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        attempt: '🔐',
        success: '✅',
        error: '❌',
        rate_limit: '🚫',
        component_mount: '🔄',
        session_check: '📊'
      }
      console.log(`${emoji[type]} [AuthDebug] ${message}`, data ? data : '')
    }
  }

  getRecentLogs(minutes: number = 5): typeof this.logs {
    const since = Date.now() - (minutes * 60 * 1000)
    return this.logs.filter(log => log.timestamp > since)
  }

  getAttemptCount(minutes: number = 2): number {
    const since = Date.now() - (minutes * 60 * 1000)
    return this.logs.filter(log => 
      log.timestamp > since && 
      (log.type === 'attempt' || log.type === 'session_check')
    ).length
  }

  exportLogs(): string {
    return JSON.stringify(this.logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp).toISOString()
    })), null, 2)
  }

  clear(): void {
    this.logs = []
    console.log('🧹 Auth debug logs cleared')
  }

  // Get summary of potential issues
  getSummary(): {
    totalAttempts: number
    recentAttempts: number
    errorCount: number
    rateLimitHits: number
    suspiciousActivity: string[]
  } {
    const recentLogs = this.getRecentLogs(5)
    const attempts = recentLogs.filter(l => l.type === 'attempt').length
    const errors = recentLogs.filter(l => l.type === 'error').length
    const rateLimits = recentLogs.filter(l => l.type === 'rate_limit').length
    
    const suspiciousActivity: string[] = []
    
    // Check for rapid attempts
    if (attempts > 5) {
      suspiciousActivity.push(`${attempts} login attempts in 5 minutes`)
    }
    
    // Check for component mount loops
    const mounts = recentLogs.filter(l => l.type === 'component_mount').length
    if (mounts > 10) {
      suspiciousActivity.push(`${mounts} component mounts in 5 minutes (possible render loop)`)
    }
    
    // Check for session check loops
    const sessionChecks = recentLogs.filter(l => l.type === 'session_check').length
    if (sessionChecks > 20) {
      suspiciousActivity.push(`${sessionChecks} session checks in 5 minutes (possible useEffect loop)`)
    }
    
    return {
      totalAttempts: this.logs.filter(l => l.type === 'attempt').length,
      recentAttempts: attempts,
      errorCount: errors,
      rateLimitHits: rateLimits,
      suspiciousActivity
    }
  }
}

export const authDebugger = AuthDebugger.getInstance()

// Global debugging function for console access
if (typeof window !== 'undefined') {
  (window as any).authDebugger = authDebugger
}
