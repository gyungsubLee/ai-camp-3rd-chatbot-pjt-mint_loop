'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Destination } from '@/lib/types';

interface DestinationModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationModal({ destination, isOpen, onClose }: DestinationModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActivePhotoIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!destination) return null;

  const photos = destination.placeDetails?.photos || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-full overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-100">
                <div>
                  <h2 className="font-serif text-xl text-gray-900">{destination.name}</h2>
                  <p className="text-sm text-gray-500">{destination.city}, {destination.country}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-gray-600">✕</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Photo Gallery */}
                {photos.length > 0 && (
                  <div className="relative group">
                    <div className="aspect-video bg-cream-100 overflow-hidden">
                      <motion.img
                        key={activePhotoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={photos[activePhotoIndex]?.url || ''}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {photos.length > 1 && (
                      <>
                        {/* Navigation Buttons */}
                        <button
                          onClick={() => setActivePhotoIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-sepia-600 text-lg">‹</span>
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-sepia-600 text-lg">›</span>
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {photos.slice(0, 5).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                idx === activePhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                              )}
                            />
                          ))}
                        </div>
                        {/* Counter */}
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs">
                          {activePhotoIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Rating & Stats */}
                  <div className="flex flex-wrap items-center gap-3">
                    {destination.placeDetails?.rating && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-100 rounded-full text-sm font-medium text-gray-800">
                        <span className="text-sepia-600">★</span>
                        {destination.placeDetails.rating.toFixed(1)}
                        <span className="text-gray-400 text-xs">
                          ({destination.placeDetails.user_ratings_total?.toLocaleString()})
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-100 rounded-full text-sm text-gray-700">
                      📸 {destination.photographyScore}/10
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-100 rounded-full text-sm text-gray-700">
                      🛡️ {destination.safetyRating}/10
                    </span>
                    <Badge variant="secondary">{destination.estimatedBudget || '$$'}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">{destination.description}</p>

                  {/* Match Reason */}
                  <div className="p-4 bg-cream-50 rounded-xl border border-cream-100">
                    <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider mb-2">
                      당신의 Vibe에 맞는 이유
                    </h4>
                    <p className="text-sm text-gray-700">{destination.matchReason}</p>
                  </div>

                  {/* Local Vibe */}
                  {destination.localVibe && (
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-100">
                      <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider mb-2">
                        현지 분위기
                      </h4>
                      <p className="text-sm text-gray-700 italic">&ldquo;{destination.localVibe}&rdquo;</p>
                    </div>
                  )}

                  {/* Google Info */}
                  {destination.placeDetails && (
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-100 space-y-3">
                      <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider">
                        장소 정보
                      </h4>
                      {destination.placeDetails.google_address && (
                        <p className="text-sm text-gray-600">📍 {destination.placeDetails.google_address}</p>
                      )}
                      {destination.placeDetails.is_open_now !== undefined && (
                        <p className={cn(
                          'text-sm font-medium inline-flex items-center gap-1.5',
                          destination.placeDetails.is_open_now ? 'text-green-700' : 'text-gray-500'
                        )}>
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            destination.placeDetails.is_open_now ? 'bg-green-500' : 'bg-gray-400'
                          )} />
                          {destination.placeDetails.is_open_now ? '영업 중' : '영업 종료'}
                        </p>
                      )}
                      {destination.placeDetails.opening_hours && destination.placeDetails.opening_hours.length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-sepia-600 font-medium">
                            영업시간 보기
                          </summary>
                          <ul className="mt-2 space-y-1 pl-4 text-gray-600">
                            {destination.placeDetails.opening_hours.map((hours, idx) => (
                              <li key={idx} className="text-xs">{hours}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {destination.placeDetails.phone && (
                          <a
                            href={`tel:${destination.placeDetails.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-cream-100 transition-colors border border-cream-200"
                          >
                            📞 전화
                          </a>
                        )}
                        {destination.placeDetails.website && (
                          <a
                            href={destination.placeDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-cream-100 transition-colors border border-cream-200"
                          >
                            🌐 웹사이트
                          </a>
                        )}
                        {destination.placeDetails.google_maps_url && (
                          <a
                            href={destination.placeDetails.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-cream-100 transition-colors border border-cream-200"
                          >
                            🗺️ 지도
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {destination.placeDetails?.reviews && destination.placeDetails.reviews.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider">
                        방문자 리뷰
                      </h4>
                      <div className="space-y-2">
                        {destination.placeDetails.reviews.slice(0, 3).map((review, idx) => (
                          <div key={idx} className="p-3 bg-cream-50 rounded-xl border border-cream-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-sepia-100 flex items-center justify-center text-xs font-medium text-sepia-700">
                                {review.author?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{review.author}</p>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={cn(
                                        'text-xs',
                                        i < (review.rating || 0) ? 'text-sepia-500' : 'text-gray-200'
                                      )}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {destination.activities && destination.activities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider">
                        추천 경험
                      </h4>
                      <div className="space-y-2">
                        {destination.activities.slice(0, 3).map((activity, idx) => (
                          <div key={idx} className="p-3 bg-cream-50 rounded-xl border border-cream-100">
                            <h5 className="font-medium text-gray-900 text-sm">{activity.name}</h5>
                            <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                            {(activity.duration || activity.bestTime) && (
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                {activity.duration && <span>⏱️ {activity.duration}</span>}
                                {activity.bestTime && <span>🕐 {activity.bestTime}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photography Tips */}
                  {destination.photographyTips && destination.photographyTips.length > 0 && (
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-100">
                      <h4 className="text-xs font-semibold text-sepia-700 uppercase tracking-wider mb-3">
                        📸 촬영 팁
                      </h4>
                      <ul className="space-y-2">
                        {destination.photographyTips.slice(0, 3).map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-sepia-100 flex items-center justify-center text-xs text-sepia-600 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Best Time & Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-cream-100 px-3 py-1.5 rounded-full">
                      🗓️ {destination.bestTimeToVisit}
                    </span>
                    {destination.tags?.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-cream-100 bg-cream-50">
                <div className="flex gap-3">
                  {destination.placeDetails?.google_maps_url && (
                    <a
                      href={destination.placeDetails.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="primary" size="lg" className="w-full">
                        🗺️ Google Maps
                      </Button>
                    </a>
                  )}
                  {destination.placeDetails?.website && (
                    <a
                      href={destination.placeDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="secondary" size="lg" className="w-full">
                        🌐 웹사이트
                      </Button>
                    </a>
                  )}
                  {!destination.placeDetails?.google_maps_url && !destination.placeDetails?.website && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="primary" size="lg" className="w-full">
                        🔍 Google 검색
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
