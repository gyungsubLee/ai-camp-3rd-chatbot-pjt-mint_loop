'use client';

import { motion } from 'framer-motion';

interface UnwrappingAnimationProps {
  onComplete: () => void;
}

export function UnwrappingAnimation({ onComplete }: UnwrappingAnimationProps) {
  return (
    <div className="relative w-64 h-72">
      {/* Main box body (revealed) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cream-200 to-cream-300 rounded-lg shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      />

      {/* Ribbon bow - untying animation */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
        initial={{ scale: 1, y: 0 }}
        animate={{ scale: 0, y: -100, rotate: 360 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Left loop */}
        <motion.div
          className="absolute -left-8 top-1/2 -translate-y-1/2 w-10 h-7 bg-gradient-to-l from-sepia-300 to-sepia-400 rounded-full -rotate-12"
          initial={{ rotate: -12 }}
          animate={{ rotate: -45, x: -20 }}
          transition={{ duration: 0.4 }}
        />
        {/* Right loop */}
        <motion.div
          className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-7 bg-gradient-to-r from-sepia-300 to-sepia-400 rounded-full rotate-12"
          initial={{ rotate: 12 }}
          animate={{ rotate: 45, x: 20 }}
          transition={{ duration: 0.4 }}
        />
        {/* Center knot */}
        <div className="relative w-6 h-6 bg-gradient-to-br from-sepia-400 to-sepia-500 rounded-full" />
      </motion.div>

      {/* Vertical ribbon - sliding off */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 z-20"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 300, opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeIn' }}
      >
        <div className="w-full h-full bg-gradient-to-r from-sepia-400 via-sepia-300 to-sepia-400" />
      </motion.div>

      {/* Horizontal ribbon - sliding off */}
      <motion.div
        className="absolute top-1/3 left-0 right-0 h-8 z-20"
        initial={{ x: 0, opacity: 1 }}
        animate={{ x: 300, opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeIn' }}
      >
        <div className="w-full h-full bg-gradient-to-b from-sepia-400 via-sepia-300 to-sepia-400" />
      </motion.div>

      {/* Top wrapper - peeling up */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-sepia-100 to-cream-100 rounded-t-lg origin-bottom z-10 overflow-hidden"
        initial={{ rotateX: 0, y: 0 }}
        animate={{ rotateX: -180, y: -60, opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Paper texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmNWYwZTYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZThlMGQwIi8+PC9zdmc+')] opacity-50" />
      </motion.div>

      {/* Left wrapper piece - tearing away */}
      <motion.div
        className="absolute top-1/3 bottom-0 left-0 w-1/2 bg-gradient-to-r from-sepia-100 to-cream-100 rounded-bl-lg origin-right z-10"
        initial={{ rotateY: 0, x: 0 }}
        animate={{
          rotateY: -120,
          x: -80,
          y: 20,
          opacity: 0
        }}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Torn edge effect */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-cream-200 to-transparent"
          style={{
            clipPath: 'polygon(0 0, 100% 5%, 50% 10%, 100% 15%, 30% 20%, 100% 25%, 60% 30%, 100% 35%, 40% 40%, 100% 45%, 70% 50%, 100% 55%, 20% 60%, 100% 65%, 50% 70%, 100% 75%, 30% 80%, 100% 85%, 60% 90%, 100% 95%, 0 100%)'
          }}
        />
      </motion.div>

      {/* Right wrapper piece - tearing away */}
      <motion.div
        className="absolute top-1/3 bottom-0 right-0 w-1/2 bg-gradient-to-l from-sepia-100 to-cream-100 rounded-br-lg origin-left z-10"
        initial={{ rotateY: 0, x: 0 }}
        animate={{
          rotateY: 120,
          x: 80,
          y: 20,
          opacity: 0
        }}
        transition={{ delay: 0.75, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Torn edge effect */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-l from-cream-200 to-transparent"
          style={{
            clipPath: 'polygon(100% 0, 0 5%, 50% 10%, 0 15%, 70% 20%, 0 25%, 40% 30%, 0 35%, 60% 40%, 0 45%, 30% 50%, 0 55%, 80% 60%, 0 65%, 50% 70%, 0 75%, 70% 80%, 0 85%, 40% 90%, 0 95%, 100% 100%)'
          }}
        />
      </motion.div>

      {/* Paper scraps flying */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-gradient-to-br from-cream-100 to-sepia-100 rounded-sm"
          style={{
            width: 8 + Math.random() * 16,
            height: 6 + Math.random() * 12,
            left: '50%',
            top: '50%',
          }}
          initial={{
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1,
            delay: 0.6 + i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Sparkle effects */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          initial={{
            opacity: 0,
            scale: 0,
            left: '50%',
            top: '50%'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`
          }}
          transition={{
            duration: 0.6,
            delay: 1 + i * 0.1,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Animation complete trigger */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
