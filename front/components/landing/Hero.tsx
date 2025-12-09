'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

// Cherry blossom effect component
function CherryBlossom() {
  const petals = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 10 + 8,
      duration: Math.random() * 4 + 5,
      delay: Math.random() * 6,
    }));
  }, []);

  return (
    <div className="petals">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Snow effect component
function Snowfall() {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 4,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="snowfall">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const slides = [
  { src: '/img/1.avif', alt: 'Travel vibe 1', season: 'spring' },
  { src: '/img/2.png', alt: 'Travel vibe 2', season: 'summer' },
  { src: '/img/스크린샷 2025-12-09 오후 4.57.02.png', alt: 'Autumn landscape', season: 'autumn' },
  { src: '/img/4.jpg', alt: 'Travel vibe 4', season: 'winter' },
] as const;

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream-50">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentIndex].src}
              alt={slides[currentIndex].alt}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Cherry blossom effect for spring */}
        <AnimatePresence>
          {slides[currentIndex].season === 'spring' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <CherryBlossom />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Snow effect for winter */}
        <AnimatePresence>
          {slides[currentIndex].season === 'winter' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Snowfall />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Brand Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-block px-4 py-2 mb-8 text-sm font-bold tracking-wider text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/40"
          >
            AI-Powered Vibe Travel
          </motion.span>

          {/* Main Headline */}
          <div className="relative inline-block mb-8">
            <h1 className="relative font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.48] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              당신은 티켓만 끊으세요.
              <br />
              <span className={`tripkit-highlight tripkit-highlight--${slides[currentIndex].season}`}>
                여행의 &apos;분위기&apos;
              </span>는
              <br />
              우리가 챙겨드립니다.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-white max-w-3xl mx-auto mb-12 font-normal leading-relaxed md:leading-loose tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            AI가 당신의 여행 &apos;바이브&apos;를 분석하여
            <br className="hidden md:block" />
            숨겨진 장소, 필름 카메라 스타일, 완벽한 스타일링을 큐레이션합니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="group px-8 py-4 text-lg border-2 border-sepia-800 bg-sepia-800 hover:bg-sepia-700 hover:border-white">
                <span>나만의 Vibe 찾기</span>
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <Link href="/concept">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white text-white hover:bg-white/30">
                컨셉 둘러보기
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
