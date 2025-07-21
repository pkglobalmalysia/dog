'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { authDebugger } from '@/lib/auth-debugger'

export default function RateLimitTestPage() {
  const { signIn, getRateLimitInfo, resetRateLimit } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('wrongpassword')
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null)
  const [testResults, setTestResults] = useState<string[]>([])

  const updateRateLimitInfo = useCallback(() => {
    const info = getRateLimitInfo()
    setRateLimitInfo(info)
    return info
  }, [getRateLimitInfo])

  useEffect(() => {
    updateRateLimitInfo()
  }, [updateRateLimitInfo])

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  const testSignIn = async () => {
    addTestResult('Testing sign in with invalid credentials...')
    const info = updateRateLimitInfo()
    
    if (info.isRateLimited) {
      addTestResult(`Rate limited: ${info.message}`)
      return
    }

    const result = await signIn(email, password)
    
    if (result.error) {
      addTestResult(`Sign in failed: ${result.error.message}`)
    } else {
      addTestResult('Sign in successful!')
    }
    
    updateRateLimitInfo()
  }

  const handleResetRateLimit = () => {
    resetRateLimit()
    updateRateLimitInfo()
    addTestResult('Rate limit manually reset')
  }

  const generateDebugReport = () => {
    const report = authDebugger.getSummary()
    console.log('Auth Debug Report:', report)
    addTestResult('Debug report generated in console')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Rate Limiting Test Page</h1>
      
      {/* Rate Limit Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Rate Limit Status</h2>
        {rateLimitInfo && (
          <div className="space-y-2">
            <div className={`p-2 rounded ${rateLimitInfo.isRateLimited ? 'bg-red-100' : 'bg-green-100'}`}>
              <strong>Status:</strong> {rateLimitInfo.isRateLimited ? 'RATE LIMITED' : 'OK'}
            </div>
            {rateLimitInfo.message && (
              <div className="p-2 bg-yellow-100 rounded">
                <strong>Message:</strong> {rateLimitInfo.message}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Attempts:</strong> {rateLimitInfo.attempts || 0}
              </div>
              <div>
                <strong>Remaining Time:</strong> {rateLimitInfo.remainingTime ? `${rateLimitInfo.remainingTime} min` : 'None'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-white p-4 border rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Test Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 border rounded"
          />
        </div>
        <div className="space-x-2 space-y-2">
          <button
            onClick={testSignIn}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={rateLimitInfo?.isRateLimited}
          >
            Test Sign In
          </button>
          <button
            onClick={handleResetRateLimit}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Reset Rate Limit
          </button>
          <button
            onClick={updateRateLimitInfo}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Status
          </button>
          <button
            onClick={generateDebugReport}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Generate Debug Report
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Test Results</h2>
        <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded border">
          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <div key={index} className="text-sm py-1 border-b border-gray-200 last:border-b-0">
                {result}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No test results yet. Click Test Sign In to begin.</p>
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-2 bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Use invalid credentials and click Test Sign In multiple times (3+ times)</li>
          <li>Watch the rate limiting kick in after multiple failed attempts</li>
          <li>Observe how the status changes from OK to RATE LIMITED</li>
          <li>Use Reset Rate Limit to clear the rate limiting manually</li>
          <li>Check the console for debug reports to see detailed activity</li>
        </ol>
      </div>
    </div>
  )
}
