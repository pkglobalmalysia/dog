"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Clock, Eye, EyeOff } from "lucide-react"

export default function TeacherSignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
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
        role: "teacher",
        approved: false,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
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
            <div className="bg-[#1e1e1e] p-8 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Account Created!</h2>
              <p className="text-gray-300 text-center mb-6">Your teacher account has been submitted for review</p>

              <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-200 mb-6">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pending Admin Approval</strong>
                  <br />
                  Your teacher account has been created but requires admin approval before you can access the system.
                  You will receive an email notification once your account is approved.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Admin will review your application</li>
                  <li>• You&apos;ll receive email confirmation when approved</li>
                  <li>• Once approved, you can create and manage courses</li>
                  <li>• You&apos;ll have access to student management tools</li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - yellow panel with illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-600 to-yellow-800 p-16 items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-5xl font-bold mb-4">Welcome to</h2>
            <h3 className="text-5xl font-bold mb-6">teacher portal</h3>
            <p className="text-yellow-100">Your account is pending approval</p>

            <div className="absolute bottom-0 right-0 transform translate-y-1/4">
              <img src="/placeholder.svg?height=400&width=400" alt="Teacher illustration" className="opacity-90" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Sign Up</h1>
          <p className="text-gray-400 mb-8">Create a new teacher account to manage courses and students</p>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">
                Full Name
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
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500"
                placeholder="Enter your professional email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
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
                Confirm Password
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

            <Alert className="bg-blue-900/20 border-blue-800/30 text-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Teacher accounts require admin approval before activation. This process typically
                takes 24-48 hours.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 h-12 mt-4"
            >
              {isLoading ? "Creating Account..." : "Create Teacher Account"}
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
          <h3 className="text-5xl font-bold mb-6">teacher portal</h3>
          <p className="text-yellow-100">Create your teacher account</p>

          <div className="absolute bottom-0 right-0 transform translate-y-1/4">
            <img src="/placeholder.svg?height=400&width=400" alt="Teacher illustration" className="opacity-90" />
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
