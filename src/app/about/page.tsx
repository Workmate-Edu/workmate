"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Landmark, Sun, Stars, BookOpen, Heart } from "lucide-react" // Changed Baobab to Landmark since it's not in lucide-react

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section with Tree Symbol */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 opacity-10">
          <Landmark className="w-full h-full text-primary" />
        </div>
        
        <motion.div 
          className="container mx-auto max-w-3xl text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Come, Gather Under Our Digital Baobab
          </h1>
          <p className="text-xl text-muted-foreground">
            In Africa, they say when an elder dies, a library burns. 
            Let us preserve our heritage, one lesson at a time.
          </p>
        </motion.div>
      </section>

      {/* Story Sections */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl space-y-20">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <Sun className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">The Dawn of Our Journey</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Long ago, our ancestors passed down knowledge beneath great baobabs, 
              where wisdom flowed like rivers through generations. Today, in lands 
              far from home, our children yearn for these roots. This is why 
              Workmate was born - to bridge the ancient and the new, bringing 
              the wisdom of Africa to every child's screen.
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <Stars className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">Our Sacred Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We illuminate the path of knowledge for our children, weaving together 
              the wisdom of African roots with modern education. Each lesson 
              beats with the rhythm of our heritage, as our teachers bring alive 
              the stories of our lands. Here, every child discovers their roots 
              while growing wings for tomorrow.
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">The Knowledge We Share</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From the whispers of Yoruba to the calculations of modern science, 
              we weave together the best of both worlds. Our teachers are the 
              new griots, sharing not just lessons, but the stories and spirit 
              of Africa. Here, STEM education dances with African languages, 
              creating a harmony of learning that exists nowhere else.
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">Join Our Circle</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              As the sun sets in one part of Africa and rises in another, our 
              digital baobab spreads its branches across oceans. Under its shade, 
              children of the diaspora find their way home through knowledge. 
              Come, let your child join this circle of learning, where every 
              lesson is a return to our roots, and every achievement is celebrated 
              with the joy of our ancestors.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
