'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Application Error</h2>
            <p className="text-gray-600 max-w-md">
              A critical error occurred. Please refresh the page or contact support if the problem persists.
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
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
