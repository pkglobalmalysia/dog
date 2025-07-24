import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
        <p className="text-gray-600 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
