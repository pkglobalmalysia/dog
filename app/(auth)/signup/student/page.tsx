"use client";

import type React from "react";
import Navbar from "@/components/navbar";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function StudentSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [icNumber, setICNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isLoading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }
    if (!icNumber.trim()) {
      setError("IC Number is required");
      setIsLoading(false);
      return;
    }
    if (!address.trim()) {
      setError("Address is required");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { error: signUpError } = await signUp(email, password, {
        full_name: fullName.trim(),
        role: "student",
        ic_number: icNumber.trim(),
        address: address.trim(),
      });

      if (signUpError) {
        setError(signUpError.message || "An error occurred during signup");
        setIsLoading(false);
        return;
      }

      // Show success message to verify email
      setSuccess(true);
    } catch (err: unknown) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="bg-[#1e1e1e] p-8 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Verify Your Email
                </h2>
                <p className="text-gray-300 text-center mb-6">
                  A verification email has been sent to <span className="font-semibold">{email}</span>.<br />
                  Please check your inbox and verify your email before logging in.
                </p>
                <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-200">
                  <AlertDescription>
                    You must verify your email address to activate your student account.<br />
                    After verification, you can log in and access all features.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
          {/* Right side - yellow panel with illustration */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-600 to-yellow-800 p-16 items-center justify-center relative overflow-hidden">
            <div className="relative z-10 text-white max-w-lg">
              <h2 className="text-5xl font-bold mb-4">Welcome to</h2>
              <h3 className="text-5xl font-bold mb-6">student portal</h3>
              <p className="text-yellow-100">Please verify your email</p>
              <div className="absolute bottom-0 right-0 transform translate-y-1/4">
               
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
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Dark panel with signup form */}
        <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-3xl font-bold text-white mb-2">
              Student Sign Up
            </h1>
            <p className="text-gray-400 mb-8">
              Create a new student account to access courses
            </p>

            {error && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-900/20 border-red-800"
              >
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
                  placeholder="Enter your email"
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
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your address"
                />
              </div>

              {/* IC Number */}
              <div className="space-y-2">
                <Label htmlFor="icnumber" className="text-gray-300">
                  IC Number
                </Label>
                <Input
                  id="icnumber"
                  value={icNumber}
                  onChange={(e) => setICNumber(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1e1e1e] border-[#333] text-white focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your IC number"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 h-12 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Student Account"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-yellow-400 hover:text-yellow-300"
                >
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
            <h3 className="text-5xl font-bold mb-6">student portal</h3>
            <p className="text-yellow-100">Create your student account</p>

            <div className="absolute bottom-0 right-0 transform translate-y-1/4">
             
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
  );
}
