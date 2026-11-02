"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { School, Users, GraduationCap } from "lucide-react"
import type { UserRole } from "@/types/auth"

const userTypes = [
	{
		role: "student" as UserRole,
		title: "I'm a Student",
		description: "Learn for yourself: languages, STEM and AI, including adult learners",
		icon: GraduationCap,
		gradient:
			"bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30",
	},
	{
		role: "parent" as UserRole,
		title: "I'm a Parent",
		description: "Manage your children's education and connect with teachers",
		icon: Users,
		gradient:
			"bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30",
	},
	{
		role: "teacher" as UserRole,
		title: "I'm a Teacher",
		description: "Create lessons, connect with students, and grow your teaching business",
		icon: School,
		gradient:
			"bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
	},
]

export function UserTypeSelector() {
	const router = useRouter()

	const handleSelect = (role: UserRole) => {
		router.push(`/sign-up/${role}`)
	}

	return (
		<div className="w-full max-w-3xl space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-2xl font-bold">Join Workmate</h1>
				<p className="text-muted-foreground">Choose how you'll use Workmate</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				{userTypes.map(
					({ role, title, description, icon: Icon, gradient }) => (
						<Card
							key={role}
							className={`p-6 cursor-pointer backdrop-blur-sm border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${gradient}`}
							onClick={() => handleSelect(role)}
						>
							<Icon className="w-10 h-10 mb-4 text-foreground" />
							<h2 className="font-semibold mb-2 text-foreground">{title}</h2>
							<p className="text-sm text-muted-foreground">{description}</p>
						</Card>
					)
				)}
			</div>
		</div>
	)
}
