import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  if (!session?.user || session.user.role !== "student") {
    redirect("/sign-in")
  }

  return <>{children}</>
}
