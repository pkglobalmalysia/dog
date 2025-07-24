'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Dashboard Error</h2>
        <p className="text-gray-600 max-w-md">
          An error occurred while loading the dashboard. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Refresh Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
