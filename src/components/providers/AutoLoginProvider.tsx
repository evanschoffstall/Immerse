'use client'

import { getTestUserEmail, isTestMode } from '@/lib/db/test-mode'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

/**
 * Auto-login provider for TEST_MODE
 * Automatically signs in the test user when TEST_MODE is enabled
 */
export function AutoLoginProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const hasAttemptedLogin = useRef(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Wait for client-side hydration
    if (!isClient) {
      return
    }

    // Only attempt once per component mount
    if (hasAttemptedLogin.current) {
      return
    }

    // Skip if not in test mode
    if (!isTestMode()) {
      console.log('🔐 [AUTO-LOGIN] Test mode not enabled')
      return
    }

    // Skip if already authenticated
    if (status === 'authenticated') {
      console.log('🔐 [AUTO-LOGIN] Already authenticated')
      return
    }

    // Wait for session to load
    if (status === 'loading') {
      return
    }

    // Auto-login with test credentials
    if (status === 'unauthenticated') {
      hasAttemptedLogin.current = true

      const testEmail = getTestUserEmail()
      const testPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || 'admin'

      console.log('🔐 [AUTO-LOGIN] Attempting login as:', testEmail)

      signIn('credentials', {
        email: testEmail,
        password: testPassword,
        redirect: false,
      }).then((result) => {
        if (result?.ok) {
          console.log('✅ [AUTO-LOGIN] Success! Reloading...')
          window.location.reload()
        } else {
          console.error('❌ [AUTO-LOGIN] Failed:', result?.error || result?.status)
        }
      }).catch((error) => {
        console.error('❌ [AUTO-LOGIN] Exception:', error)
      })
    }
  }, [status, isClient])

  return <>{children}</>
}
