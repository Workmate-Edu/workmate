"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    quote: "WorkMate has transformed how I connect with students. The platform makes it easy to manage my classes and focus on what matters most - teaching.",
    author: "Sarah Chen",
    role: "STEM Teacher"
  },
  {
    quote: "The collaborative features have made group projects so much more efficient. It's like having a virtual study room available 24/7.",
    author: "Michael Park",
    role: "Computer Science Student"
  },
  {
    quote: "Managing assignments and tracking progress has never been easier. WorkMate streamlines everything beautifully.",
    author: "Dr. Emma Wilson",
    role: "University Professor"
  }
]

export function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 lg:flex lg:flex-col lg:justify-between p-8">
      <div className="flex items-center text-lg font-medium text-white">
        <Link href="/" className="text-xl font-bold hover:text-white/90">WorkMate</Link>
      </div>

      <div className="space-y-8">
        <div className="relative space-y-4">
          <div className="text-xl font-medium leading-relaxed text-white transition-opacity duration-500">
            "{testimonials[currentTestimonial].quote}"
          </div>
          <div className="text-sm text-white/80">
            <div className="font-semibold">{testimonials[currentTestimonial].author}</div>
            <div>{testimonials[currentTestimonial].role}</div>
          </div>
        </div>

        <div className="flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                currentTestimonial === index
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </div>

      <div className="text-sm text-white/60">
        © {new Date().getFullYear()} WorkMate. All rights reserved.
      </div>
    </div>
  )
}
