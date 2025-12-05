'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { getConceptById } from '@/lib/constants/concepts';
import { ImageGenerationForm } from '@/components/generate/ImageGenerationForm';
import { GeneratedImageCard } from '@/components/generate/GeneratedImageCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface GenerationResult {
  imageUrl: string;
  optimizedPrompt: string;
  destination: string;
  filmStock: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const { selectedConcept, preferences, addGeneratedImage } = useVibeStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [lastFormData, setLastFormData] = useState<{
    destination: string;
    additionalPrompt: string;
    selectedFilm: string;
  } | null>(null);

  const concept = selectedConcept ? getConceptById(selectedConcept) : null;

  // 컨셉이 선택되지 않은 경우 리다이렉트
  useEffect(() => {
    if (!selectedConcept) {
      router.push('/concept');
    }
  }, [selectedConcept, router]);

  const handleGenerate = async (formData: {
    destination: string;
    additionalPrompt: string;
    selectedFilm: string;
  }) => {
    if (!concept) return;

    setIsLoading(true);
    setError(null);
    setLastFormData(formData);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          concept: concept.id,
          filmStock: formData.selectedFilm,
          colorPalette: concept.colorPalette,
          outfitStyle: concept.outfitStyle,
          additionalPrompt: formData.additionalPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Image generation failed');
      }

      setResult({
        imageUrl: data.imageUrl,
        optimizedPrompt: data.optimizedPrompt,
        destination: formData.destination,
        filmStock: formData.selectedFilm,
      });

      // Store에 생성된 이미지 저장
      addGeneratedImage(formData.destination, data.imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the image'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastFormData) {
      handleGenerate(lastFormData);
    }
  };

  const handleContinue = () => {
    router.push('/destinations');
  };

  if (!concept) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">컨셉을 먼저 선택해주세요</p>
          <Link href="/concept" className="text-sepia-600 hover:underline">
            컨셉 선택하러 가기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl text-gray-900">
                여행 이미지 생성
              </h1>
              <p className="text-sm text-gray-500">
                {concept.nameKo} 감성으로 여행 사진 미리보기
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{concept.nameKo}</Badge>
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
            당신의 여행을 미리 만나보세요
          </h2>
          {preferences.travelScene ? (
            <div className="space-y-2">
              <p className="text-gray-600 max-w-lg mx-auto">
                대화에서 말씀하신 <strong>&ldquo;{preferences.travelScene}&rdquo;</strong>를
                <br />
                <strong>{concept.nameKo}</strong> 감성으로 그려드릴게요!
              </p>
              <p className="text-sm text-sepia-600">
                아래에서 내용을 수정하거나 바로 생성할 수 있어요.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 max-w-lg mx-auto">
              여행지를 입력하면 <strong>{concept.nameKo}</strong> 감성의
              {' '}<strong>{concept.recommendedFilms[0]}</strong> 필름으로 촬영한 듯한
              여행 사진을 생성해 드려요.
            </p>
          )}
        </motion.div>

        {/* 결과가 없을 때: 입력 폼 표시 */}
        {!result && (
          <ImageGenerationForm
            concept={concept}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            initialDestination={preferences.travelDestination || ''}
            initialAdditionalPrompt={preferences.travelScene || ''}
          />
        )}

        {/* 로딩 상태 */}
        {isLoading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-white rounded-2xl border border-cream-200 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12">
                <svg className="animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">이미지 생성 중...</h3>
                <p className="text-sm text-gray-500">
                  {concept.nameKo} 감성을 담아 그리고 있어요
                </p>
              </div>
            </div>

            {/* 스켈레톤 */}
            <Skeleton className="w-full aspect-square rounded-xl mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </motion.div>
        )}

        {/* 에러 상태 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <h3 className="text-red-800 font-medium mb-1">
              이미지 생성에 실패했어요
            </h3>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={() => lastFormData && handleGenerate(lastFormData)}
              className="text-red-700 text-sm underline hover:no-underline"
            >
              다시 시도하기
            </button>
          </motion.div>
        )}

        {/* 결과 표시 */}
        {result && (
          <GeneratedImageCard
            imageUrl={result.imageUrl}
            concept={concept}
            destination={result.destination}
            filmStock={result.filmStock}
            optimizedPrompt={result.optimizedPrompt}
            onRegenerate={handleRegenerate}
            onContinue={handleContinue}
            isLoading={isLoading}
          />
        )}

        {/* 네비게이션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
