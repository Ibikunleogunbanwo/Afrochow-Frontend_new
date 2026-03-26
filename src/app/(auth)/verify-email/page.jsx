"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { VerifyEmailModal } from "@/components/signin/VerifyEmailModal"
import { SignInModal } from "@/components/signin/SignInModal"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [showSignIn, setShowSignIn] = useState(false)

  return (
      <>
        <VerifyEmailModal
            isOpen={!showSignIn}
            onClose={() => {}}
            email={email}
            onSignInClick={() => setShowSignIn(true)}
        />
        <SignInModal
            isOpen={showSignIn}
            onClose={() => setShowSignIn(false)}
        />
      </>
  )
}