'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

export function DestinationCard({ destination, index }: DestinationCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={cn(
        'bg-white rounded-2xl overflow-hidden border transition-all duration-300',
        isExpanded
          ? 'border-sepia-300 shadow-xl'
          : 'border-cream-200 hover:border-cream-300 hover:shadow-md'
      )}
    >
      {/* Header (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Thumbnail Placeholder */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative bg-sepia-100 flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>

        {/* Title & Location */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg text-gray-900 mb-1">
            {destination.name}
          </h3>
          <p className="text-sm text-gray-500">
            {destination.city}, {destination.country}
          </p>
          {!isExpanded && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" size="sm">
                📸 {destination.photographyScore}/10
              </Badge>
              <Badge variant="secondary" size="sm">
                {destination.estimatedBudget || '$$'}
              </Badge>
            </div>
          )}
        </div>

        {/* Expand Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center"
        >
          <span className="text-gray-500 text-sm">▼</span>
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 space-y-4">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {destination.description}
              </p>

              {/* Match Reason */}
              <div className="bg-sepia-50 rounded-xl p-4 border border-sepia-100">
                <h4 className="text-sm font-medium text-sepia-800 mb-2 flex items-center gap-2">
                  <span>✓</span> 당신의 Vibe에 맞는 이유
                </h4>
                <p className="text-sm text-sepia-700">
                  {destination.matchReason}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-cream-50 rounded-xl">
                  <div className="text-xl mb-1">📸</div>
                  <div className="text-xs text-gray-500 mb-0.5">포토 스팟</div>
                  <div className="font-semibold text-gray-900">
                    {destination.photographyScore}/10
                  </div>
                </div>
                <div className="text-center p-3 bg-cream-50 rounded-xl">
                  <div className="text-xl mb-1">🚃</div>
                  <div className="text-xs text-gray-500 mb-0.5">접근성</div>
                  <div className="font-semibold text-gray-900 capitalize text-sm">
                    {destination.transportAccessibility === 'easy'
                      ? '쉬움'
                      : destination.transportAccessibility === 'moderate'
                      ? '보통'
                      : '어려움'}
                  </div>
                </div>
                <div className="text-center p-3 bg-cream-50 rounded-xl">
                  <div className="text-xl mb-1">🛡️</div>
                  <div className="text-xs text-gray-500 mb-0.5">안전도</div>
                  <div className="font-semibold text-gray-900">
                    {destination.safetyRating}/10
                  </div>
                </div>
              </div>

              {/* Best Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🗓️</span>
                <span>추천 시기: {destination.bestTimeToVisit}</span>
              </div>

              {/* Tags */}
              {destination.tags && (
                <div className="flex flex-wrap gap-2">
                  {destination.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <Link
                href={`/destinations/${destination.id}/spots`}
                className="block"
              >
                <Button variant="primary" size="lg" className="w-full">
                  <span>숨겨진 스팟 탐색하기</span>
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
