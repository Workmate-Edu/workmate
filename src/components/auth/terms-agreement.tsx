import Link from "next/link"

export function TermsAgreement() {
  return (
    <div className="text-sm text-muted-foreground text-center">
      By creating an account, you agree to our{" "}
      <Link 
        href="/terms" 
        className="text-primary hover:underline"
        target="_blank"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link 
        href="/privacy" 
        className="text-primary hover:underline"
        target="_blank"
      >
        Privacy Policy
      </Link>
    </div>
  )
}
