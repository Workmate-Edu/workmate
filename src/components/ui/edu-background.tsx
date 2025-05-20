'use client'

import { motion } from 'framer-motion'

export function EduBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Mathematics symbols */}
      <motion.div
        className="absolute top-20 left-10 text-4xl opacity-10"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        ∑
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-4xl opacity-10"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        π
      </motion.div>
      {/* Add more floating elements for fun */}
    </div>
  )
}
