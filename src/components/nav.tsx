"use client"

import { Menu, X, Bell } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/auth-store"
import { Logo } from "./logo"
import { UserNav } from "./user-nav"

const navItems = [
	{ href: "/languages", label: "African Languages" },
	{ href: "/stem", label: "STEM & AI" },
	{ href: "/about", label: "Our Story" },
	{ href: "/pricing", label: "Pricing" },
]

export default function Nav() {
	const pathname = usePathname()
	const isDashboard = pathname?.startsWith("/dashboard")
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const { data: session, status } = useSession() // <-- add status here
	const router = useRouter()
	const authStore = useAuthStore()

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!menuRef.current || !buttonRef.current) return
			const isNotificationClick = (event.target as Element)?.closest(
					'[data-notification-menu="true"], [data-user-menu="true"]'
			)
			if (
				isMenuOpen &&
				!menuRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node) &&
				!isNotificationClick
			) {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isMenuOpen])

	const isAuthenticated = !!session?.user

	// Helper: is admin or blogger
	const isAdmin = session?.user?.role === "admin"
	const isBlogger = !!session?.user?.blogger

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
			<nav className="container flex h-16 items-center justify-between max-w-screen-2xl mx-auto px-4 xl:px-8 2xl:px-16">
				<div
					className={cn(
						"flex items-center relative",
						isDashboard && "md:invisible"
					)}
				>
					<Logo />
					<span className="absolute -right-12 top-0 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-sm">
						BETA
					</span>
				</div>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-6 ml-6">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							{item.label}
						</Link>
					))}
					{/* Admin/Blog Dashboard Button */}
					{(isAdmin || isBlogger) && (
						<Link
							href="/blog/dashboard"
							className="text-sm font-semibold flex items-center gap-2 px-3 py-1 rounded bg-primary text-white hover:bg-primary/90 transition"
							style={{ marginLeft: "1rem" }}
						>
							Blog Dashboard
						</Link>
					)}
				</div>

				{/* Desktop Auth */}
				<div className="hidden md:flex items-center gap-4">
					{status === "loading" ? (
						<span role="status" className="text-sm text-muted-foreground">Loading account…</span>
					) : isAuthenticated ? (
						<>
							<UserNav session={session} />
						</>
					) : (
						<>
							<Link href="/sign-in">
								<Button variant="ghost">Sign in</Button>
							</Link>
							<Link href="/sign-up">
								<Button>Get started</Button>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Toggle */}
				<button
					ref={buttonRef}
					aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
					aria-expanded={isMenuOpen}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="p-2 -mr-2 md:hidden hover:bg-accent rounded-md transition-colors"
				>
					{isMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</button>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div
						ref={menuRef}
						className="absolute top-full left-0 right-0 z-50 bg-background border-b shadow-lg md:hidden animate-in slide-in-from-top-2"
					>
						<div className="container py-4 flex flex-col space-y-4">
							<div className="flex flex-col space-y-1">
								{navItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className="text-base font-medium px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors active:bg-accent/80"
										onClick={() => setIsMenuOpen(false)}
									>
										{item.label}
									</Link>
								))}
								{/* Admin/Blog Dashboard Button (Mobile) */}
								{(isAdmin || isBlogger) && (
									<Link
										href="/blog/dashboard"
										className="text-base font-semibold px-4 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition"
										onClick={() => setIsMenuOpen(false)}
									>
										Blog Dashboard
									</Link>
								)}
							</div>
							<div className="flex flex-col gap-2 pt-4 border-t">
								{status === "loading" ? (
									<span role="status" className="px-4 text-sm text-muted-foreground">Loading account…</span>
								) : isAuthenticated ? (
									<>
										<div className="px-4">
											<UserNav
												session={session}
												onNavigate={() => setIsMenuOpen(false)}
											/>
										</div>
									</>
								) : (
									<>
										<Link
											href="/sign-in"
											onClick={() => setIsMenuOpen(false)}
										>
											<Button
												variant="ghost"
												className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
											>
												Sign in
											</Button>
										</Link>
										<Link
											href="/sign-up"
											onClick={() => setIsMenuOpen(false)}
										>
											<Button className="w-full hover:opacity-90 transition-opacity">
												Get started
											</Button>
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>
		</header>
	)
}
