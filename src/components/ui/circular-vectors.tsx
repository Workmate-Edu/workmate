'use client'

import { motion } from 'framer-motion'

export function CircularVectors() {
  return (
    <div className="absolute inset-0 -z-20">
      {/* Main circle */}
      <motion.div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full border-[2px] border-dashed border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-40 h-40 rounded-full bg-secondary/20 blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      {/* Floating circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-primary/10"
          style={{
            width: `${100 + i * 30}px`,
            height: `${100 + i * 30}px`,
            left: `${20 + i * 5}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Double ring */}
      <div className="absolute left-[10%] bottom-[10%]">
        <motion.div
          className="w-40 h-40 rounded-full border-4 border-primary/10"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 w-40 h-40 rounded-full border-4 border-secondary/10"
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </div>
  )
}
