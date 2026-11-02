'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Atom, Calculator, TestTube, Microscope, Brain, Code } from 'lucide-react'
import type { StemTopic } from '@/types'
import { Button } from '@/components/ui/button'

const stemTopics: StemTopic[] = [
	{
		title: 'Artificial Intelligence',
		description: 'Explore AI with age-appropriate projects and responsible use',
		icon: Brain,
		gradient: 'from-violet-500/10 via-purple-500/10 to-amber-500/10',
		subjects: ['AI Fundamentals', 'Machine Learning', 'Responsible AI', 'Future AI & Superintelligence'],
		modules: ['Creative AI Projects', 'Critical Thinking', 'Exploring Possible AI Futures'],
	},
	{
		title: 'Math',
		description: 'Build strong foundations in mathematics with interactive learning',
		icon: Calculator,
		gradient: 'from-blue-500/10 via-indigo-500/10 to-violet-500/10',
		subjects: [
			'Number & Algebra',
			'Geometry & Measures',
			'Statistics & Probability',
			'Calculus',
		],
		modules: [
			'Interactive Problem Solving',
			'Real-world Applications',
			'Visual Learning Tools',
		],
	},
	{
		title: 'Physics',
		description: 'Explore the fundamental laws that govern our universe',
		icon: Atom,
		gradient: 'from-red-500/10 via-orange-500/10 to-yellow-500/10',
		subjects: [
			'Mechanics & Motion',
			'Energy & Electricity',
			'Waves & Light',
			'Modern Physics',
		],
		modules: [
			'Virtual Lab Experiments',
			'Interactive Simulations',
			'Real-world Projects',
		],
	},
	{
		title: 'Chemistry',
		description: 'Discover the building blocks of matter and chemical processes',
		icon: TestTube,
		gradient: 'from-green-500/10 via-teal-500/10 to-cyan-500/10',
		subjects: [
			'Atomic Structure',
			'Chemical Reactions',
			'Organic Chemistry',
			'Materials',
		],
		modules: [
			'Digital Lab Work',
			'Molecular Modeling',
			'Green Chemistry',
		],
	},
	{
		title: 'Biology',
		description: 'Study life sciences from cellular to ecosystem levels',
		icon: Microscope,
		gradient: 'from-purple-500/10 via-pink-500/10 to-red-500/10',
		subjects: [
			'Cell Biology',
			'Genetics',
			'Ecology',
			'Human Biology',
		],
		modules: [
			'Virtual Dissections',
			'Gene Expression',
			'Ecosystem Studies',
		],
	},
	{
		title: 'Computer Science',
		description: 'Learn programming and digital technology fundamentals',
		icon: Code,
		gradient: 'from-indigo-500/10 via-blue-500/10 to-purple-500/10',
		subjects: [
			'Programming',
			'Data Structures',
			'Web Development',
			'AI Basics',
		],
		modules: [
			'Coding Projects',
			'App Development',
			'Digital Solutions',
		],
	},
]

export default function STEMPage() {
	const router = useRouter()
	const { data: session } = useSession()

	const handleStartLearning = (topicTitle: string) => {
		if (topicTitle === 'Artificial Intelligence') {
			router.push('/pricing')
			return
		}
		if (!session) {
			router.push(
				`/sign-in?callbackUrl=/dashboard/learn/stem/${topicTitle.toLowerCase()}`
			)
			return
		}
		router.push(`/dashboard/learn/stem/${topicTitle.toLowerCase()}`)
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Science & Technology</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Explore STEM and AI through engaging, interactive learning
						experiences
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{stemTopics.map((topic) => (
						<div
							key={topic.title}
							className={`group relative overflow-hidden rounded-xl border border-border/50 
              bg-gradient-to-br ${topic.gradient} hover:border-primary/50 
              hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 
              hover:-translate-y-1 backdrop-blur-sm`}
						>
							{/* Animated background pattern */}
							<div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
								<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] 
                bg-[length:20px_20px]" />
							</div>

							<div className="relative p-6 z-10">
								<div className="flex items-center gap-4 mb-4">
									<div className="p-3 rounded-xl bg-primary/10 transform group-hover:scale-110 
                  group-hover:rotate-3 transition-all duration-300">
										<topic.icon className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
											{topic.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{topic.description}
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<h4 className="text-sm font-medium mb-2">Topics:</h4>
										<div className="flex flex-wrap gap-2">
											{topic.subjects.map((subject) => (
												<span
													key={subject}
													className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
												>
													{subject}
												</span>
											))}
										</div>
									</div>

									<div>
										<h4 className="text-sm font-medium mb-2">
											Learning Features:
										</h4>
										<ul className="text-sm text-muted-foreground space-y-1">
											{topic.modules.map((module) => (
												<li key={module}>• {module}</li>
											))}
										</ul>
									</div>
								</div>

								<Button
									onClick={() => handleStartLearning(topic.title)}
									className="mt-6 w-full bg-primary/90 hover:bg-primary shadow-sm 
                  hover:shadow-lg transition-all duration-300"
								>
									{session ? 'Take Assessment' : 'Start Learning'}
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
