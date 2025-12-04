'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getConceptById } from '@/lib/constants/concepts';
import type { Destination } from '@/lib/types';

// Mock destinations data (replace with API call)
const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'dest_1',
    name: 'Cinque Terre 히든 트레일',
    city: 'Cinque Terre',
    country: 'Italy',
    description:
      '크루즈 관광객들이 모르는 숨겨진 하이킹 코스. 다섯 개의 알록달록한 절벽 마을을 연결하는 비밀 트레일에서 진정한 이탈리아 해안의 아름다움을 만나보세요.',
    matchReason:
      '로맨틱한 해안 절경과 빈티지 이탈리아 감성이 어우러져 필름 사진에 완벽합니다. 파스텔 컬러 건물과 드라마틱한 절벽이 멋진 배경을 제공합니다.',
    bestTimeToVisit: '4월 말 - 6월 초 (봄꽃 시즌, 적은 관광객)',
    photographyScore: 9,
    transportAccessibility: 'moderate',
    safetyRating: 9,
    estimatedBudget: '$$',
    tags: ['coastal', 'hiking', 'photography', 'authentic'],
  },
  {
    id: 'dest_2',
    name: 'Montmartre 예술가 거리',
    city: 'Paris',
    country: 'France',
    description:
      '피카소, 반 고흐, 툴루즈 로트렉이 살았던 역사적인 언덕 동네. 조약돌 거리, 숨겨진 안뜰, 현지 예술가들의 작업실이 있는 진정한 보헤미안의 영혼.',
    matchReason:
      '빈티지 미학과 예술적 감성에 완벽합니다. 1920년대 파리의 보헤미안 정신을 고스란히 간직한 시대를 초월한 매력이 있습니다.',
    bestTimeToVisit: '9월 - 10월 (가을 색감, 여름 인파 이후)',
    photographyScore: 10,
    transportAccessibility: 'easy',
    safetyRating: 8,
    estimatedBudget: '$$$',
    tags: ['urban', 'art', 'history', 'bohemian'],
  },
  {
    id: 'dest_3',
    name: 'Porto Ribeira 지구',
    city: 'Porto',
    country: 'Portugal',
    description:
      '다채로운 타일 파사드, 좁은 중세 거리, 전통 포트 와인 셀러가 있는 강변 동네. 느린 페이스의 진정한 포르투갈 라이프스타일.',
    matchReason:
      '로맨틱한 강변 풍경과 빈티지 건축물이 어우러집니다. 다른 유럽 도시보다 저렴하면서도 진정한 매력을 유지하고 있습니다.',
    bestTimeToVisit: '5월 - 6월 (따뜻한 날씨, 성수기 전)',
    photographyScore: 8,
    transportAccessibility: 'easy',
    safetyRating: 9,
    estimatedBudget: '$',
    tags: ['riverside', 'wine', 'architecture', 'affordable'],
  },
];

export default function DestinationsPage() {
  const { selectedConcept, preferences, setDestinations, destinations } =
    useVibeStore();
  const [isLoading, setIsLoading] = useState(true);

  const concept = selectedConcept ? getConceptById(selectedConcept) : null;

  useEffect(() => {
    // Simulate API call
    const loadDestinations = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDestinations(MOCK_DESTINATIONS);
      setIsLoading(false);
    };

    if (destinations.length === 0) {
      loadDestinations();
    } else {
      setIsLoading(false);
    }
  }, [destinations.length, setDestinations]);

  const displayDestinations =
    destinations.length > 0 ? destinations : MOCK_DESTINATIONS;

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
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3">
            당신의 Vibe에 맞는 여행지를 찾았어요! ✨
          </h2>
          <p className="text-gray-600">
            관광객들이 모르는 숨겨진 명소들로 가득한 3곳의 특별한 여행지입니다.
          </p>
        </motion.div>

        {/* Destination Cards */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons
            <>
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
          ) : (
            displayDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                index={index}
              />
            ))
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
