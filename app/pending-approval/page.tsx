"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PendingApprovalPage() {
  const { profile, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && profile) {
      // If user is approved, redirect to their dashboard
      if (profile.approved) {
        switch (profile.role) {
          case "teacher":
            router.push("/dashboard/teacher")
            break
          case "student":
            router.push("/dashboard/student")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      }
    }
  }, [profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    router.push("/login")
    return null
  }

  const getStatusIcon = () => {
    if (profile.approved) {
      return <CheckCircle className="h-12 w-12 text-green-500" />
    }
    return <Clock className="h-12 w-12 text-yellow-500" />
  }

  const getStatusMessage = () => {
    if (profile.approved) {
      return {
        title: "Account Approved!",
        description: "Your account has been approved. You will be redirected to your dashboard shortly.",
        color: "text-green-600",
      }
    }
    return {
      title: "Pending Approval",
      description:
        "Your teacher account is pending approval from an administrator. You will receive an email notification once your account is approved.",
      color: "text-yellow-600",
    }
  }

  const status = getStatusMessage()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className={`text-2xl ${status.color}`}>{status.title}</CardTitle>
          <CardDescription className="text-center">{status.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Account Details:</h3>
            <p className="text-sm text-blue-700">
              <strong>Name:</strong> {profile.full_name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> {profile.email}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Role:</strong> {profile.role}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Status:</strong> {profile.approved ? "Approved" : "Pending"}
            </p>
          </div>

          {!profile.approved && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• An administrator will review your application</li>
                <li>• You will receive an email when approved</li>
                <li>• Once approved, you can access the teacher dashboard</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Refresh Status
            </Button>
            <Button variant="destructive" onClick={signOut} className="flex-1">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
