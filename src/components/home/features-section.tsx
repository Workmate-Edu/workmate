import { GraduationCap, Users, Globe, Atom } from "lucide-react"
import type { Feature } from '@/types'

const features: Feature[] = [
  {
    icon: Users,
    title: "Learn Your Way",
    description: "Solo learning, family groups, or friend circles - choose what works for you"
  },
  {
    icon: Globe,
    title: "Cultural Journey",
    description: "Experience the richness of African heritage through language and science"
  },
  {
    icon: Atom,
    title: "Fun Discovery",
    description: "Interactive projects and games that make learning exciting for all ages"
  },
  {
    icon: GraduationCap,
    title: "Expert Guides",
    description: "Learn from passionate teachers who make every lesson an adventure"
  }
]

export function FeaturesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-slate-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
            Why Choose Our Platform?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
            Connecting African Heritage with Modern Education
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
          {features.map((feature, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
