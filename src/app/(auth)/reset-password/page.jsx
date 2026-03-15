"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ResetPasswordModal } from "@/components/signin/ResetPasswordModal"
import { ForgotPasswordModal } from "@/components/signin/ForgotPasswordModal"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  return (
      <>
        <ResetPasswordModal
            isOpen={!showForgotPassword}
            token={token}
            onForgotPasswordClick={() => setShowForgotPassword(true)}
        />
        <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
        />
      </>
  )
}