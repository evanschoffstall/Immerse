
'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center p-4">
      <div className="space-y-5 text-center max-w-md">
        <div className="flex justify-center">
          <Compass className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-5xl font-semibold tracking-tight">404</h1>
          <p className="text-base text-muted-foreground">Page not found</p>
        </div>
        <div className="flex gap-2 justify-center flex-wrap pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}
