'use client'

import { motion } from 'framer-motion'
import { Binary, Calculator, Book, Atom, Globe2, Code2 } from 'lucide-react'

export function EduBackground() {
  const floatingIcons = [
    { Icon: Binary, position: "top-20 left-20", size: 48, color: "primary" },
    { Icon: Calculator, position: "top-40 right-32", size: 56, color: "secondary" },
    { Icon: Book, position: "bottom-32 left-1/4", size: 40, color: "primary" },
    { Icon: Atom, position: "top-1/3 right-1/4", size: 52, color: "secondary" },
    { Icon: Globe2, position: "bottom-1/4 right-1/3", size: 44, color: "primary" },
    { Icon: Code2, position: "top-1/2 left-32", size: 48, color: "secondary" }
  ]

  return (
    <>
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, position, size, color }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} hidden md:block`}
          animate={{
            y: [0, -20, 0],
            x: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 8,
            delay: index * 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Icon 
            size={size} 
            className={`text-${color}/20`}
          />
        </motion.div>
      ))}

      {/* Gradient Blobs */}
      <motion.div
        className="absolute -top-48 -left-48 w-96 h-96 bg-primary/30 rounded-full blur-[128px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute -bottom-48 -right-48 w-96 h-96 bg-secondary/30 rounded-full blur-[128px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </>
  )
}
