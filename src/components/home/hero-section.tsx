'use client'

import { motion } from 'framer-motion'
import { EduBackground } from '@/components/ui/edu-background'
import { AfricanVectors } from '@/components/ui/african-vectors'
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
    <section className="relative overflow-hidden bg-background/95 min-h-[90vh]">
      <CircularVectors />
      <div className="relative z-10">
        <EduBackground />
        <AfricanVectors />
        
        <motion.div className="relative z-20"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center py-12 sm:py-16 lg:py-20">
            <motion.div
              variants={slideVariants}
              className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Perfect for Ages 6-16</span>
              <span className="sm:hidden">Kids 6-16</span>
            </motion.div>

            <motion.h1
              variants={slideVariants}
              className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold"
            >
              <span className="block">Give Your Child The Gift of</span>
              <span className="block text-primary">STEM & African Languages</span>
            </motion.h1>

            <motion.p
              variants={slideVariants}
              className="text-xl text-muted-foreground max-w-[42rem] leading-normal"
            >
              Help your children excel in science and mathematics while connecting with African languages
            </motion.p>

            <motion.div
              variants={slideVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-3xl w-full"
            >
              {/* Reorder cards to put STEM first */}
              <div className="bg-card p-6 rounded-lg border shadow-sm flex items-start gap-4">
                <Beaker className="h-8 w-8 text-secondary flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold">STEM Education</h3>
                  <p className="text-muted-foreground text-sm">Fun experiments and math games</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm flex items-start gap-4">
                <Globe2 className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold">African Languages</h3>
                  <p className="text-muted-foreground text-sm">Interactive lessons with native speakers</p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto mt-8">
              <Link
                href="/assessment"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all group"
              >
                <span>Find Your Child's Learning Style</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-md border border-primary bg-background px-8 text-sm font-medium text-primary hover:bg-primary/10 transition-all"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
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
