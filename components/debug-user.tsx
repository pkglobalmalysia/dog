"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"

export default function DebugUser() {
  const { user, profile } = useAuth()
  
  useEffect(() => {
    console.log("=== USER DEBUG INFO ===")
    console.log("User:", user)
    console.log("User ID:", user?.id)
    console.log("User email:", user?.email)
    console.log("User metadata:", user?.user_metadata)
    console.log("Profile:", profile)
    console.log("Profile role:", profile?.role)
    console.log("=== END DEBUG INFO ===")
  }, [user, profile])
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold text-lg mb-2">Current User Debug Info:</h3>
      <div className="space-y-1 text-sm">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Role:</strong> {profile?.role || user?.user_metadata?.role || 'No role'}</p>
        <p><strong>Full Name:</strong> {profile?.full_name || user?.user_metadata?.full_name || 'No name'}</p>
      </div>
      
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
        <p className="font-semibold">Teacher with Events:</p>
        <p>Email: pkibs.office@gmail.com</p>
        <p>ID: 03eef332-2c31-4b32-bae6-352f0c17c947</p>
        <p>Name: teacher sophie</p>
      </div>
      
      {user?.id !== '03eef332-2c31-4b32-bae6-352f0c17c947' && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>⚠️ You need to be logged in as pkibs.office@gmail.com to see calendar events.</strong>
        </div>
      )}
      
      {user?.id === '03eef332-2c31-4b32-bae6-352f0c17c947' && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          <strong>✅ You are logged in as the correct teacher account.</strong>
        </div>
      )}
    </div>
  )
}
