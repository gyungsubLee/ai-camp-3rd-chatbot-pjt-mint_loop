'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CONCEPTS } from '@/lib/constants/concepts';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { ConceptCard } from '@/components/concept/ConceptCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Concept } from '@/lib/types';

export default function ConceptPage() {
  const router = useRouter();
  const { selectedConcept, setConcept, preferences } = useVibeStore();
  const [localSelected, setLocalSelected] = useState<Concept | null>(
    selectedConcept
  );

  const handleSelect = (conceptId: Concept) => {
    setLocalSelected(conceptId);
    setConcept(conceptId);
  };

  const handleContinue = () => {
    if (localSelected) {
      router.push('/destinations');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-gray-900">컨셉 선택</h1>
            <p className="text-sm text-gray-500">
              당신의 여행 스타일을 선택하세요
            </p>
          </div>
          {preferences.mood && (
            <Badge variant="secondary">
              ✓ Vibe: {preferences.mood}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
            어떤 감성으로 여행을 기록하고 싶으신가요?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            세 가지 컨셉 중 하나를 선택하면, 그에 맞는 장소, 카메라, 스타일을
            큐레이션해드립니다.
          </p>
        </motion.div>

        {/* Concept Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {CONCEPTS.map((concept, index) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ConceptCard
                concept={concept}
                isSelected={localSelected === concept.id}
                onSelect={() => handleSelect(concept.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: localSelected ? 1 : 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!localSelected}
            className="px-12"
          >
            여행지 추천받기 →
          </Button>
          {!localSelected && (
            <p className="text-sm text-gray-500 mt-3">
              컨셉을 선택해주세요
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
