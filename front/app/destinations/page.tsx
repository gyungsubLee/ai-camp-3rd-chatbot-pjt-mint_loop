'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { getConceptById } from '@/lib/constants/concepts';
import type { Destination } from '@/lib/types';

export default function DestinationsPage() {
  const { selectedConcept, preferences, setDestinations, destinations } =
    useVibeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const concept = selectedConcept ? getConceptById(selectedConcept) : null;

  // AI 기반 여행지 추천 API 호출
  const loadDestinations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          concept: selectedConcept,
          travelScene: preferences.travelScene,
          travelDestination: preferences.travelDestination,
        }),
      });

      const data = await response.json();

      if (data.status === 'success' && data.destinations) {
        setDestinations(data.destinations);
      } else {
        throw new Error('Failed to get recommendations');
      }
    } catch (err) {
      console.error('Failed to load destinations:', err);
      setError('추천을 불러오는 데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [preferences, selectedConcept, setDestinations]);

  useEffect(() => {
    // 항상 사용자 취향 기반 추천을 새로 불러옴
    loadDestinations();
  }, []);  // 최초 1회만 실행

  const displayDestinations = destinations;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl text-gray-900">
                추천 여행지
              </h1>
              <p className="text-sm text-gray-500">
                당신의 Vibe에 맞는 특별한 장소들
              </p>
            </div>
            <div className="flex items-center gap-2">
              {concept && (
                <Badge variant="primary">{concept.nameKo}</Badge>
              )}
              {preferences.mood && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {preferences.mood}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro - 사용자 취향 반영 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3">
            {preferences.travelScene
              ? '당신의 꿈꾸는 여행을 위한 특별한 장소'
              : '당신의 Vibe에 맞는 숨겨진 명소'}
          </h2>

          {preferences.travelScene && (
            <div className="bg-sepia-50 rounded-xl p-4 mb-4 text-left max-w-lg mx-auto border border-sepia-100">
              <p className="text-sm text-sepia-600 mb-1">꿈꾸는 장면:</p>
              <p className="text-sepia-800 font-medium italic">
                &ldquo;{preferences.travelScene}&rdquo;
              </p>
            </div>
          )}

          <p className="text-gray-600">
            관광객들이 모르는 <strong>진짜 현지 감성</strong>을 가진 로컬 스폿.
            <br />
            인생샷과 나만의 스토리를 만들 수 있는 특별한 여행지예요.
          </p>
        </motion.div>

        {/* 에러 상태 */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-red-700 mb-3">{error}</p>
            <Button onClick={loadDestinations} variant="secondary" size="sm">
              다시 시도
            </Button>
          </motion.div>
        )}

        {/* Destination Cards */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-sepia-600 animate-pulse">
                  AI가 당신의 취향에 맞는 숨겨진 명소를 찾고 있어요...
                </p>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-cream-200">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : displayDestinations.length > 0 ? (
            displayDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                index={index}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 추천된 여행지가 없어요</p>
              <Button onClick={loadDestinations}>
                여행지 추천받기
              </Button>
            </div>
          )}
        </div>

        {/* Back to Concept Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            href="/concept"
            className="text-sm text-gray-500 hover:text-sepia-600 transition-colors"
          >
            ← 컨셉 다시 선택하기
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
