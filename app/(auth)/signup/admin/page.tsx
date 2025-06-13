"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Shield, Eye, EyeOff } from "lucide-react"

export default function AdminSignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  // Simple admin key - in production, this should be more secure
  const ADMIN_KEY = "ADMIN_2024_LMS_PLATFORM"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (adminKey !== ADMIN_KEY) {
      setError("Invalid admin key. Please contact system administrator.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError("Full name is required")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, {
        full_name: fullName.trim(),
        role: "admin",
        approved: true,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login?message=Admin account created successfully. Please log in.")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="bg-[#1e1e1e] p-8 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Account Created!</h2>
              <p className="text-gray-300 text-center mb-6">Your administrator account has been created successfully</p>
              <Alert className="bg-green-900/20 border-green-800 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Welcome to the LMS Platform! You now have full administrative access to manage courses, teachers,
                  students, and system settings. Redirecting to login...
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Right side - yellow panel with illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-600 to-yellow-800 p-16 items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-5xl font-bold mb-4">Welcome to</h2>
            <h3 className="text-5xl font-bold mb-6">admin portal</h3>
            <p className="text-yellow-100">Your admin account has been created</p>

            <div className="absolute bottom-0 right-0 transform translate-y-1/4">
              <img src="/placeholder.svg?height=400&width=400" alt="Admin illustration" className="opacity-90" />
            </div>
          </div>

          {/* Background shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-yellow-300"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Dark panel with signup form */}
      <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            Admin Sign Up
          </h1>
          <p className="text-gray-400 mb-8">Create a new administrator account with full system access</p>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-red-900/20 border-red-800/30 text-red-200 mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Restricted Access:</strong> Admin account creation requires a valid admin key. Only authorized
              personnel should create admin accounts.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="adminKey" className="text-gray-300">
                Admin Key *
              </Label>
              <div className="relative">
                <Input
                  id="adminKey"
                  type={showAdminKey ? "text" : "password"}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500 pr-10"
                  placeholder="Enter admin key"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminKey(!showAdminKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Contact system administrator for the admin key</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500 pr-10"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 h-12 mt-4"
            >
              {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - yellow panel with illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-600 to-yellow-800 p-16 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-5xl font-bold mb-4">Welcome to</h2>
          <h3 className="text-5xl font-bold mb-6">admin portal</h3>
          <p className="text-yellow-100">Create your administrator account</p>

          <div className="absolute bottom-0 right-0 transform translate-y-1/4">
            <img src="/placeholder.svg?height=400&width=400" alt="Admin illustration" className="opacity-90" />
          </div>
        </div>

        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-yellow-300"></div>
        </div>
      </div>
    </div>
  )
}
