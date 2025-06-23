import { PricingCalculator } from "@/components/pricing-calculator"
import { Check } from "lucide-react"

const features = [
	{
		title: "Live 1-on-1 Sessions",
		description: "Personalized attention from expert tutors",
	},
	{
		title: "Interactive Learning",
		description: "Engaging digital resources and learning materials",
	},
	{
		title: "Flexible Scheduling",
		description: "Book sessions at times that work for you",
	},
	{
		title: "Progress Tracking",
		description: "Regular assessments and progress reports",
	},
	{
		title: "Learning Materials",
		description: "Access to digital worksheets and resources",
	},
	{
		title: "Parent Updates",
		description: "Regular feedback and session summaries",
	},
]

export default function PricingPage() {
	return (
		<>
			{/* Enhanced animated background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
				<div className="absolute inset-0 animate-gradient">
					<div
						className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 bg-[size:200%_200%]"
						style={{ backgroundPosition: "0 0" }}
					/>
				</div>
				<div className="absolute inset-0 bg-grid-primary/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			</div>

			<div className="container relative max-w-6xl py-12 md:py-24">
				<div className="text-center mb-12 relative z-10">
					<div className="inline-block">
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent animate-gradient bg-[size:200%_auto]">
							Simple, Transparent Pricing
						</h1>
					</div>
					<p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
						Quality education shouldn't be complicated. Our simple pricing
						structure helps you focus on what matters most - learning.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-12 items-start mb-16">
					<div className="relative">
						<div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-background blur-xl" />
						<PricingCalculator />
					</div>

					<div className="space-y-8">
						<div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-border/50">
							<h3 className="text-xl font-semibold mb-2 text-foreground">
								Why Choose Workmate?
							</h3>
							<p className="text-foreground/80">
								Our pricing includes everything you need for an effective learning
								experience - no hidden fees or surprise charges.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold mb-6">What's Included</h3>
							<div className="grid gap-4">
								{features.map((feature) => (
									<div key={feature.title} className="flex gap-4">
										<div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
											<Check className="h-4 w-4 text-primary" />
										</div>
										<div>
											<h4 className="font-medium">{feature.title}</h4>
											<p className="text-sm text-muted-foreground">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 md:p-8 mt-12 shadow-sm border border-border/50">
					<h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-medium mb-2">How are payments handled?</h3>
							<p className="text-sm text-muted-foreground">
								Payments are processed securely weekly. We accept all major credit
								cards and digital payments.
							</p>
						</div>
						<div>
							<h3 className="font-medium mb-2">Can I change my schedule?</h3>
							<p className="text-sm text-muted-foreground">
								Yes, you can modify your schedule with 24 hours notice without any
								penalty.
							</p>
						</div>
						<div>
							<h3 className="font-medium mb-2">What if I need to cancel?</h3>
							<p className="text-sm text-muted-foreground">
								No long-term commitments required. You can cancel your subscription
								at any time.
							</p>
						</div>
						<div>
							<h3 className="font-medium mb-2">Are there any additional fees?</h3>
							<p className="text-sm text-muted-foreground">
								No hidden fees. The price you see in the calculator is exactly what
								you'll pay.
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
