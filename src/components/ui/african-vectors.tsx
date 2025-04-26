'use client'

import { motion } from 'framer-motion'

export function AfricanVectors() {
  const adinkraSymbols = [
    { symbol: '◊', meaning: 'Knowledge' },
    { symbol: '○', meaning: 'Unity' },
    { symbol: '□', meaning: 'Strength' },
    { symbol: '△', meaning: 'Wisdom' }
  ]

  const floatingPatterns = [
    { shape: "●●●", meaning: "Unity" },
    { shape: "⬡", meaning: "Harmony" },
    { shape: "⬢", meaning: "Power" },
    { shape: "△△", meaning: "Growth" },
    { shape: "◈", meaning: "Prosperity" },
    { shape: "⬣", meaning: "Balance" }
  ]

  const culturalSymbols = [
    "🥁", "🌍", "⭐", "🎨", "🌟", "🎭"
  ]

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* African Pattern Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" 
        viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="africanPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10 0L20 10L10 20L0 10Z" className="fill-primary/20" />
          <circle cx="10" cy="10" r="2" className="fill-secondary/20" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#africanPattern)" />
      </svg>

      {/* Additional Floating Patterns */}
      {floatingPatterns.map((pattern, index) => (
        <motion.div
          key={`pattern-${index}`}
          className="absolute text-2xl font-serif"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: index * 1.5,
          }}
          style={{
            top: `${15 + index * 15}%`,
            right: `${10 + index * 12}%`,
            color: index % 2 ? 'var(--primary)' : 'var(--secondary)',
            opacity: 0.15
          }}
        >
          {pattern.shape}
        </motion.div>
      ))}

      {/* Cultural Emoji Symbols */}
      {culturalSymbols.map((symbol, index) => (
        <motion.div
          key={`cultural-${index}`}
          className="absolute text-2xl"
          animate={{
            y: [0, -20, 0],
            x: [-10, 10, -10],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: index * 0.8,
          }}
          style={{
            bottom: `${20 + index * 10}%`,
            left: `${5 + index * 15}%`,
            opacity: 0.2
          }}
        >
          {symbol}
        </motion.div>
      ))}

      {/* Circular Connections */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 100 100">
        <motion.path
          d="M10,50 Q30,20 50,50 T90,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          animate={{
            d: [
              "M10,50 Q30,20 50,50 T90,50",
              "M10,50 Q30,80 50,50 T90,50",
              "M10,50 Q30,20 50,50 T90,50"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Floating Adinkra Symbols */}
      {adinkraSymbols.map((symbol, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl font-serif opacity-20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: index * 2
          }}
          style={{
            top: `${25 + index * 20}%`,
            left: `${20 + index * 20}%`,
            color: index % 2 ? 'var(--primary)' : 'var(--secondary)'
          }}
        >
          {symbol.symbol}
        </motion.div>
      ))}

      {/* Language Text */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.07]">
        {['Yoruba', 'Hausa', 'Swahili', 'Igbo'].map((lang, index) => (
          <motion.div
            key={lang}
            className="absolute text-lg font-serif"
            animate={{
              y: [0, -30, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              delay: index * 2.5
            }}
            style={{
              right: `${10 + index * 25}%`,
              top: `${30 + index * 15}%`
            }}
          >
            {lang}
          </motion.div>
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
