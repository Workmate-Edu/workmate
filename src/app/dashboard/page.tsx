import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import authConfig  from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Redirect non-admin users to their role-specific dashboard
  if (session.user.role !== "admin") {
    redirect(`/dashboard/${session.user.role}`)
  }

  return <AdminDashboard />
}
