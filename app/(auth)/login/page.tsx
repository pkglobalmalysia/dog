"use client"

import type React from "react"
import Navbar from "@/components/navbar"
import Image from "next/image"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message?.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before logging in.")
        } else {
          setError(error.message || "An error occurred during login")
        }
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <><Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
      </>
    )
  }

  return (
    <><Navbar  />
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Dark panel with login form */}
      <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-gray-400 mb-8">Enter your account details</p>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-200">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500 pr-10"
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">Do not have an account? </p>
            <div className="flex justify-center gap-3 mt-2">
              <Link href="/signup/student" className="text-yellow-400 hover:text-yellow-300">
                Student
              </Link>
              <span className="text-gray-500">|</span>
              <Link href="/signup/teacher" className="text-yellow-400 hover:text-yellow-300">
                Teacher
              </Link>
              <span className="text-gray-500">|</span>
              <Link href="/signup/admin" className="text-yellow-400 hover:text-yellow-300">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - yellow panel with illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-600 to-yellow-800 p-16 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-5xl font-bold mb-4">Welcome to</h2>
          <h3 className="text-5xl font-bold mb-6">student portal</h3>
          <p className="text-yellow-100">Login to access your account</p>

          <div className="absolute bottom-0 right-0 transform translate-y-1/4">
            <Image src="/placeholder.svg?height=400&width=400" height={400} width={400} alt="Students illustration" className="opacity-90" />
          </div>
        </div>

        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-yellow-300"></div>
        </div>
      </div>
    </div>
    </>
  )
}
