"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('pkibs.office@gmail.com')
  const [password, setPassword] = useState('teachersophie')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleLogin = async () => {
    setLoading(true)
    setStatus('Starting login...')

    try {
      // Sign out first to clear any stale sessions
      setStatus('Clearing any existing sessions...')
      await supabase.auth.signOut()
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('Attempting login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setStatus(`❌ Login failed: ${error.message}`)
        setLoading(false)
        return
      }

      setStatus(`✅ Login successful! User: ${data.user?.email}`)
      
      // Verify session was created
      const { data: sessionCheck } = await supabase.auth.getSession()
      if (sessionCheck.session) {
        setStatus(prev => prev + `\n✅ Session confirmed`)
        
        // Refresh the page to let middleware pick up the session
        setStatus(prev => prev + `\n🔄 Refreshing page...`)
        
        // Force a page refresh to reset the AuthProvider state
        window.location.href = '/dashboard/teacher'
      } else {
        setStatus(prev => prev + `\n❌ Session not found after login`)
      }

    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    setStatus(`Current session: ${data.session ? `${data.session.user.email}` : 'None'}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Simple Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <button
            onClick={checkSession}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Check Session
          </button>
        </div>

        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
