import { Star } from "lucide-react"
import type { Testimonial } from '@/types'

const testimonials: Testimonial[] = [
  {
    name: "Olayinka A.",
    role: "Yoruba Language Learner",
    content: "Learning Yoruba has helped me connect with my heritage in ways I never imagined possible."
  },
  {
    name: "Kwame B.",
    role: "STEM Student",
    content: "The African perspective on science and technology has completely transformed my understanding."
  },
  {
    name: "Amina H.",
    role: "Arabic & Swahili Teacher",
    content: "Teaching languages while incorporating cultural context makes learning more meaningful for my students."
  }
]

export function TestimonialsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
            Success Stories
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
            From Our Global African Community
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">"{testimonial.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
