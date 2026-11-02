'use client'

import { motion } from 'framer-motion'
import { HeroSection } from '@/components/home/hero-section'
import { LanguageStemSection } from '@/components/home/language-stem-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CTASection } from '@/components/home/cta-section'

export default function Home() {
  const sectionVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col"
    >
      <HeroSection />
      {[LanguageStemSection, FeaturesSection, CTASection].map((Section, index) => (
        <motion.div
          key={index}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Section />
        </motion.div>
      ))}
    </motion.div>
  )
}
