"use client"

import { ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
  className?: string
}

const testimonials = [
  {
    quote: "Workmate has transformed how we collaborate and learn together. It's the perfect blend of simplicity and functionality.",
    author: "Sofia Davis",
    role: "Student at Stanford University"
  },
  {
    quote: "As a teacher, Workmate has made it incredibly easy to manage my classes and engage with students. The interface is intuitive and the features are exactly what we need.",
    author: "Michael Chen",
    role: "High School Teacher"
  },
  {
    quote: "The collaborative features in Workmate have made group projects so much more efficient. It's like having a virtual study room available 24/7.",
    author: "Emma Thompson",
    role: "Graduate Student"
  }
]

export function AuthLayout({ 
  children, 
  title, 
  description, 
  className 
}: AuthLayoutProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Sidebar */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="text-xl font-bold">Workmate</span>
          </div>

          {/* Testimonial */}
          <div className="space-y-8">
            <div className="relative space-y-4">
              <div className="text-xl font-medium leading-relaxed text-white">
                "{testimonials[currentTestimonial].quote}"
              </div>
              <div className="text-sm text-white/80">
                <div className="font-semibold">{testimonials[currentTestimonial].author}</div>
                <div>{testimonials[currentTestimonial].role}</div>
              </div>
            </div>

            {/* Testimonial Navigation Dots */}
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

          {/* Footer */}
          <div className="text-sm text-white/60">
            {new Date().getFullYear()} Workmate. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={cn("grid gap-6", className)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
