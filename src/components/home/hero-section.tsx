'use client'

import { motion } from 'framer-motion'
import { EduBackground } from '@/components/ui/edu-background'
import { AfricanVectors } from '@/components/ui/african-vectors'
import { CircularVectors } from '@/components/ui/circular-vectors'
import { GraduationCap, Beaker, Globe2, Users, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { StatsGrid } from './stats-grid'
import { LoadingLinkButton } from '@/components/ui/loading-link-button'
import Image from 'next/image'

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
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Colorful Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Educational Vector Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top floating elements */}
        <motion.svg 
          viewBox="0 0 24 24" 
          className="absolute top-20 right-[20%] w-[60px] h-[60px] animate-float opacity-70"
          fill="currentColor"
        >
          <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 4h8v2H8V8zm0 4h8v2H8v-2z" className="text-primary"/>
        </motion.svg>

        <motion.svg 
          viewBox="0 0 24 24" 
          className="absolute top-32 left-[15%] w-[50px] h-[50px] animate-float-slow opacity-70"
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" className="text-secondary" strokeWidth="2" fill="none" stroke="currentColor"/>
        </motion.svg>

        <motion.svg 
          viewBox="0 0 24 24" 
          className="absolute top-40 right-[35%] w-[40px] h-[40px] animate-float-slower opacity-70"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" className="text-primary" strokeWidth="2"/>
          <path d="M12 2a15 15 0 000 20M12 2a15 15 0 010 20M2 12h20" className="text-secondary" strokeWidth="2"/>
        </motion.svg>

        {/* Side elements */}
        <motion.svg 
          viewBox="0 0 24 24" 
          className="absolute top-1/2 left-[10%] w-[45px] h-[45px] -translate-y-1/2 animate-float opacity-70"
          fill="currentColor"
        >
          <path d="M20.71 7.04c.39-.39.39-1.04 0-1.43l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" className="text-primary"/>
        </motion.svg>

        <motion.svg 
          viewBox="0 0 24 24" 
          className="absolute top-1/2 right-[10%] w-[55px] h-[55px] -translate-y-1/2 animate-float-slow opacity-70"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" className="text-secondary"/>
          <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z" className="text-primary"/>
        </motion.svg>

        {/* Center Hero Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 200 200"
            className="w-[600px] h-[500px] animate-float"
          >
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" stopColor="currentColor"/>
                <stop offset="100%" className="text-secondary" stopColor="currentColor"/>
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#heroGrad)" fillOpacity="0.1"/>
            <path d="M100 20v160M20 100h160" stroke="currentColor" className="text-primary" strokeWidth="1" opacity="0.2"/>
            <circle cx="100" cy="100" r="40" className="text-secondary" fill="currentColor" fillOpacity="0.1"/>
          </motion.svg>
        </div>
      </div>

      {/* Content */}
      <div className="container relative pt-24 lg:pt-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div className="relative z-20"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center py-12 sm:py-16 lg:py-20">
              
              <motion.div
                variants={slideVariants}
                className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Perfect for Ages 6-16</span>
                <span className="sm:hidden">Kids 6-16</span>
              </motion.div>

              <motion.h1
                variants={slideVariants}
                className="font-heading font-bold leading-tight"
              >
                <span className="block text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
                  Give Your
                </span>
                <span className="block text-center text-xl sm:text-3xl md:text-4xl lg:text-5xl">
                  Child The Gift of
                </span>
                <span
                  className="block text-center text-primary"
                  style={{
                    whiteSpace: "normal",
                    fontSize: "clamp(1.25rem, 6vw, 2.5rem)",
                    fontWeight: 700,
                  }}
                >
                  STEM, AI & African Languages
                </span>
              </motion.h1>

              <motion.p
                variants={slideVariants}
                className="text-xl text-muted-foreground max-w-[42rem] leading-normal"
              >
                Help your child build confidence in science, mathematics and artificial intelligence while connecting with African languages.
              </motion.p>

              <motion.div
                variants={slideVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-3xl w-full"
              >
                {/* STEM Card */}
                <div className="relative bg-gradient-to-br from-secondary/5 via-secondary/10 to-transparent p-6 rounded-lg border shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_top,white,transparent)] dark:bg-grid-slate-700/50 opacity-20"></div>
                  <Beaker className="h-8 w-8 text-secondary flex-shrink-0 relative z-10" />
                  <div className="text-left relative z-10">
                    <h3 className="font-semibold">STEM & AI Education</h3>
                    <p className="text-muted-foreground text-sm">Science, maths and an introduction to AI</p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors duration-300"></div>
                </div>

                {/* Languages Card */}
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 rounded-lg border shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_top,white,transparent)] dark:bg-grid-slate-700/50 opacity-20"></div>
                  <Globe2 className="h-8 w-8 text-primary flex-shrink-0 relative z-10" />
                  <div className="text-left relative z-10">
                    <h3 className="font-semibold">African Languages</h3>
                    <p className="text-muted-foreground text-sm">Interactive lessons with native speakers</p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-300"></div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <LoadingLinkButton
                  href="/sign-up/parent"
                  loadingText="Loading..."
                  className="h-10 whitespace-nowrap bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Get started
                </LoadingLinkButton>
                <LoadingLinkButton
                  href="/pricing"
                  variant="outline" 
                  loadingText="Loading..."
                  className="h-10 w-full whitespace-nowrap border-secondary/20 bg-secondary/10 px-6 text-sm text-secondary hover:bg-secondary/20 sm:w-auto"
                >
                  View pricing
                </LoadingLinkButton>
              </div>

              <div className="w-full border-t border-border mt-16 pt-16">
                <div className="flex flex-col items-center gap-2 mb-8">
                  <div className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Independent accounts for ages 18+</span>
                    <span className="sm:hidden">Adults 18+</span>
                  </div>
                  <h2 className="text-xl font-medium">Adults & Professionals</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <Link 
                    href="/languages"
                    className="group relative bg-gradient-to-br from-secondary/5 via-background to-primary/5 hover:bg-gradient-to-br hover:from-secondary/10 hover:via-background hover:to-primary/10 p-6 rounded-lg border shadow-sm transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-700/50 opacity-20"></div>
                    <div className="relative z-10">
                      <h3 className="font-semibold text-lg mb-2 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Parents Learning Journey</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Learn alongside your children or start your own language journey
                      </p>
                      <span className="text-sm text-secondary hover:text-secondary/80 font-medium inline-flex items-center">
                        Browse Languages 
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors duration-300"></div>
                  </Link>
                  
                  <Link 
                    href="/languages"
                    className="group relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 hover:bg-gradient-to-br hover:from-primary/10 hover:via-background hover:to-secondary/10 p-6 rounded-lg border shadow-sm transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-700/50 opacity-20"></div>
                    <div className="relative z-10">
                      <h3 className="font-semibold text-lg mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">African Language Programs</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        For professionals, heritage learners, and enthusiasts
                      </p>
                      <span className="text-sm text-secondary hover:text-secondary/80 font-medium inline-flex items-center">
                        Explore Programs
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-300"></div>
                  </Link>
                </div>
              </div>

              <StatsGrid />

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
              </div>

              {/* Hero Vector Illustration */}
              <div className="relative flex-1">
                <Image
                  src="/illustrations/hero-learning.svg"
                  alt="Online Learning Illustration"
                  width={600}
                  height={500}
                  priority
                  className="animate-float"
                />
                {/* Floating elements */}
                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-purple-500/10 rounded-full animate-float-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-blue-500/10 rounded-full animate-float-slower" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
