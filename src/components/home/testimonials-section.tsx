'use client'

import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

const testimonials = [
  {
    name: "Mrs. Adebayo O.",
    role: "Parent of 2",
    content: "The platform has made it easy for my children to learn Yoruba while excelling in their STEM subjects. The progress tracking helps me stay involved.",
    stars: 5
  },
  {
    name: "Dr. Kwame B.",
    role: "Parent & Professional",
    content: "As a busy professional, I appreciate how the platform allows me to learn alongside my children. The flexible scheduling is perfect for our family.",
    stars: 5
  },
  {
    name: "Aisha H.",
    role: "Mother of Three",
    content: "My children's understanding of mathematics has improved significantly, and they're now teaching me Arabic words they've learned!",
    stars: 5
  },
  {
    name: "Mr. Johnson C.",
    role: "Single Parent",
    content: "The platform's parent-teacher communication features help me stay connected with my child's learning journey despite my busy schedule.",
    stars: 5
  },
  {
    name: "Mrs. Fatima M.",
    role: "Parent & Language Enthusiast",
    content: "We've made learning African languages a family activity. The cultural context in lessons has brought us closer to our roots.",
    stars: 5
  },
  {
    name: "Mr. Samuel T.",
    role: "Parent of Gifted Child",
    content: "The personalized learning approach and expert teachers have helped my daughter advance beyond grade level in both languages and STEM.",
    stars: 5
  }
]

const cardColors = [
  "from-[#FF6B6B]/20 to-[#4ECDC4]/20 hover:from-[#FF6B6B]/30 hover:to-[#4ECDC4]/30",
  "from-[#6C63FF]/20 to-[#FF6584]/20 hover:from-[#6C63FF]/30 hover:to-[#FF6584]/30",
  "from-[#45B8AC]/20 to-[#FF9A8B]/20 hover:from-[#45B8AC]/30 hover:to-[#FF9A8B]/30",
  "from-[#96C3EB]/20 to-[#7F7FD5]/20 hover:from-[#96C3EB]/30 hover:to-[#7F7FD5]/30",
  "from-[#08D9D6]/20 to-[#FF2E63]/20 hover:from-[#08D9D6]/30 hover:to-[#FF2E63]/30",
  "from-[#FFA41B]/20 to-[#FF5151]/20 hover:from-[#FFA41B]/30 hover:to-[#FF5151]/30"
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  
  const cardsToShow = isMobile ? 1 : isTablet ? 2 : 3
  const totalSlides = Math.ceil(testimonials.length / cardsToShow)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-background/95 overflow-hidden">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
            Success Stories
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
            From Our Global African Community
          </p>
        </div>

        <div className="relative mt-12">
          <div className="flex justify-between items-center absolute -left-4 -right-4 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevSlide}
              className="rounded-full bg-background/80 backdrop-blur-sm"
            >
              ←
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextSlide}
              className="rounded-full bg-background/80 backdrop-blur-sm"
            >
              →
            </Button>
          </div>

          <div className="overflow-hidden px-4">
            <motion.div 
              className="flex gap-6"
              animate={{
                x: `-${currentIndex * 100}%`
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={`flex-shrink-0 w-full md:w-1/2 lg:w-1/3`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`h-full p-6 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardColors[index % cardColors.length]} transition-all duration-300 hover:scale-[1.02]`}>
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                          <p className="text-sm text-foreground/80">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-foreground/90 flex-grow">{testimonial.content}</p>
                      <div className="flex gap-1">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalSlides)].map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-primary w-4' : 'bg-primary/20'
                }`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
