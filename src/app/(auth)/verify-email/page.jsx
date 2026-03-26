"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { VerifyEmailModal } from "@/components/signin/VerifyEmailModal"
import { SignInModal } from "@/components/signin/SignInModal"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
            // After login, useAuth already calls router.push("/").
            // Using a no-op here prevents the verify modal from re-opening
            // for the brief moment before that navigation completes.
            onClose={() => router.push("/")}
        />
      </>
  )
}