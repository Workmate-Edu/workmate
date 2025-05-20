"use client"

import { motion } from 'framer-motion'
import { EduBackground } from '@/components/ui/edu-background'
import { CircularVectors } from '@/components/ui/circular-vectors'
import { GraduationCap, Beaker, Globe2, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { StatsGrid } from './stats-grid'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const slideVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 1
      }
    }
  }

  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-primary/30 via-primary/10 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-32">
        <motion.div 
          className="relative z-20"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center py-12 sm:py-16 lg:py-20">
            <motion.div
              variants={slideVariants}
              className="rounded-full bg-black/10 px-4 py-1.5 text-sm font-medium text-foreground flex items-center gap-2 backdrop-blur-sm"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Perfect for Ages 6-16</span>
              <span className="sm:hidden">Kids 6-16</span>
            </motion.div>

            <motion.h1
              variants={slideVariants}
              className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-foreground"
            >
              <span className="block text-foreground">Give Your Child The Gift of</span>
              <span className="block text-primary font-extrabold">
                STEM & African Languages
              </span>
            </motion.h1>

            <motion.p
              variants={slideVariants}
              className="text-xl text-foreground/90 max-w-[42rem] leading-normal font-medium"
            >
              Help your children excel in science and mathematics while connecting with African languages
            </motion.p>

            {/* Update cards with semi-transparent background */}
            <motion.div
              variants={slideVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-3xl w-full"
            >
              {/* STEM Card with secondary gradient */}
              <div className="bg-gradient-to-br from-secondary/90 to-secondary-foreground/70 p-6 rounded-lg border border-white/20 backdrop-blur-sm flex items-start gap-4 hover:shadow-lg transition-all">
                <Beaker className="h-8 w-8 text-white flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-bold text-white">STEM Education</h3>
                  <p className="text-white/90 text-sm">Fun experiments and math games</p>
                </div>
              </div>

              {/* Languages Card with cultural gradient */}
              <div className="bg-gradient-to-br from-primary/90 to-primary-foreground/70 p-6 rounded-lg border border-white/20 backdrop-blur-sm flex items-start gap-4 hover:shadow-lg transition-all">
                <Globe2 className="h-8 w-8 text-white flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-bold text-white">African Languages</h3>
                  <p className="text-white/90 text-sm">Interactive lessons with native speakers</p>
                </div>
              </div>
            </motion.div>

            {/* Update buttons with new styles */}
            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto mt-8">
              <Link
                href="/assessment"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-lg font-medium text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Find Your Child's Learning Style</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-md bg-secondary/90 px-8 text-lg font-medium text-secondary-foreground hover:bg-secondary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            <p className="text-sm text-primary-foreground/80 mt-4 text-center sm:text-left">
              Take our 1-minute assessment to create a personalized learning path
            </p>

            <div className="w-full border-t border-border mt-16 pt-16">
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Perfect for Ages 16+</span>
                  <span className="sm:hidden">Ages 16+</span>
                </div>
                <h2 className="text-xl font-medium">Adults & Professionals</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Link 
                  href="/languages"
                  className="group relative bg-card hover:bg-secondary/5 p-6 rounded-lg border shadow-sm transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">Parents Learning Journey</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Learn alongside your children or start your own language journey
                  </p>
                  <span className="text-sm text-secondary hover:text-secondary/80 font-medium">
                    Browse Languages →
                  </span>
                </Link>
                
                <Link 
                  href="/languages"
                  className="group relative bg-card hover:bg-secondary/5 p-6 rounded-lg border shadow-sm transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">African Language Programs</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    For professionals, heritage learners, and enthusiasts
                  </p>
                  <span className="text-sm text-secondary hover:text-secondary/80 font-medium">
                    Explore Programs →
                  </span>
                </Link>
              </div>
            </div>

            <StatsGrid />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
