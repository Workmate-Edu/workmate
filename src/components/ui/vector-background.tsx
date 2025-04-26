'use client'

import { motion } from 'framer-motion'

export function VectorBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Educational Grid Pattern */}
      <svg className="absolute w-full h-full opacity-[0.15]">
        <defs>
          <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40V0H40" fill="none" className="stroke-primary/20" strokeWidth="0.5" />
          </pattern>
          <pattern id="squares" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="url(#grid)" />
            <circle cx="40" cy="40" r="2" className="fill-primary/30" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#squares)" />
      </svg>

      {/* Floating Math Symbols */}
      <motion.div 
        className="absolute top-1/4 left-1/4 text-4xl text-primary/20 font-serif select-none"
        animate={{ y: [-20, 20], x: [-10, 10] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      >
        Σ
      </motion.div>
      <motion.div 
        className="absolute top-1/3 right-1/3 text-4xl text-secondary/20 font-serif select-none"
        animate={{ y: [20, -20], x: [10, -10] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
      >
        π
      </motion.div>
      <motion.div 
        className="absolute bottom-1/3 right-1/4 text-4xl text-primary/20 font-serif select-none"
        animate={{ y: [-15, 15], x: [-5, 5] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
      >
        ∫
      </motion.div>

      {/* Gradient Circles */}
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-96 w-96 rounded-full bg-primary/20 blur-[100px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2">
        <motion.div
          className="h-96 w-96 rounded-full bg-secondary/20 blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* DNA Double Helix Pattern */}
      <svg className="absolute right-0 h-full w-48 opacity-20" viewBox="0 0 100 800">
        <motion.path
          d="M50 0Q75 200 25 400T50 800"
          className="stroke-primary fill-none"
          strokeWidth="0.5"
          animate={{ d: ["M50 0Q75 200 25 400T50 800", "M50 0Q25 200 75 400T50 800"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M50 0Q25 200 75 400T50 800"
          className="stroke-secondary fill-none"
          strokeWidth="0.5"
          animate={{ d: ["M50 0Q25 200 75 400T50 800", "M50 0Q75 200 25 400T50 800"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
    </div>
  )
}
