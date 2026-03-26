"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { VerifyEmailModal } from "@/components/signin/VerifyEmailModal"
import { SignInModal } from "@/components/signin/SignInModal"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const email        = searchParams.get("email") || ""
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <>
      {/* Full-page OTP card — rendered directly, no modal wrapper */}
      {!showSignIn && (
        <VerifyEmailModal
          email={email}
          onClose={() => router.push("/")}
          onSignInClick={() => setShowSignIn(true)}
        />
      )}

      {/* Sign-in modal slides in after successful verification */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => router.push("/")}
      />
    </>
  )
}
