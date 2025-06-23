import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { FaFacebook, FaLinkedin, FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6"

const footerLinks = [
	{
		title: "Company",
		links: [
			{ label: "About Us", href: "/about" },
			{ label: "Contact", href: "/contact" },
			// { label: "Blog", href: "/blog" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "African Languages", href: "/languages" },
			{ label: "STEM", href: "/stem" },
			{ label: "Stories", href: "/stories" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" },
		],
	},
] as const

export function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container py-8 md:py-12">
				<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
					<div className="flex flex-col gap-4">
						<Link href="/" className="flex items-center gap-2">
							<Logo size={40} />
							<span className="font-semibold">Workmate</span>
						</Link>
						<p className="text-sm text-muted-foreground">
							Empowering African education through technology and culture
						</p>
					</div>

					{footerLinks.map((group) => (
						<div key={group.title}>
							<h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
							<ul className="space-y-2">
								{group.links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-muted-foreground hover:text-primary"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
					<div className="flex justify-center gap-4 text-xl">
						<a
							href="https://web.facebook.com/workmateteam"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
						>
							<FaFacebook />
						</a>
						<a
							href="https://www.linkedin.com/company/workmate-team/?viewAsMember=true"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="LinkedIn"
						>
							<FaLinkedin />
						</a>
						<a
							href="https://www.instagram.com/workmate_team/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
						>
							<FaInstagram />
						</a>
						<a
							href="https://www.tiktok.com/@workmate_team"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="TikTok"
						>
							<FaTiktok />
						</a>
						<a
							href="https://x.com/Workmate_Team"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="X (Twitter)"
						>
							<FaXTwitter />
						</a>
						<a
							href="https://www.youtube.com/@Workmate_Team"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="YouTube"
						>
							<FaYoutube />
						</a>
					</div>
					<p>© {new Date().getFullYear()} Workmate. All rights reserved.</p>
				</div>
			</div>
		</footer>
	)
}
