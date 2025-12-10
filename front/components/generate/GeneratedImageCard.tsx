'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ConceptData } from '@/lib/constants/concepts';

interface GeneratedImageCardProps {
  imageUrl: string;
  concept: ConceptData;
  destination: string;
  filmStock: string;
  optimizedPrompt?: string;
  onRegenerate: () => void;
  onContinue: () => void;
  isLoading: boolean;
}

export function GeneratedImageCard({
  imageUrl,
  concept,
  destination,
  filmStock,
  optimizedPrompt,
  onRegenerate,
  onContinue,
  isLoading,
}: GeneratedImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-lg"
    >
      {/* 필름 타입 헤더 */}
      <div className="h-8 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
        <span className="text-white text-xs font-medium tracking-wide">
          🎞️ {concept.filmType} Style
        </span>
      </div>

      {/* 필름 스프로킷 홀 디자인 */}
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {filmStock.toUpperCase().replace(' ', '-')}
        </span>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"
            />
          ))}
        </div>
      </div>

      {/* 이미지 컨테이너 */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={imageUrl}
          alt={`${destination} - ${concept.nameKo} 스타일`}
          fill
          className="object-cover"
          unoptimized // DALL-E URL은 외부 URL이므로
        />

        {/* 필름 오버레이 효과 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 약간의 비네팅 효과 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
          {/* 필름 그레인 텍스처 (CSS로 구현) */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* 날짜 스탬프 (필름 스타일) */}
        <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded">
          <span className="text-orange-400 font-mono text-xs">
            {new Date().toLocaleDateString('en-US', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            }).replace(/\//g, '.')}
          </span>
        </div>
      </div>

      {/* 필름 스프로킷 홀 하단 */}
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {concept.name.toUpperCase()}
        </span>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"
            />
          ))}
        </div>
      </div>

      {/* 메타데이터 */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl text-gray-900 mb-1">
              {destination}
            </h3>
            <div className="flex gap-2">
              <Badge variant="primary">{concept.nameKo}</Badge>
              <Badge variant="secondary">{filmStock}</Badge>
            </div>
          </div>
        </div>

        {/* 프롬프트 미리보기 (접힌 상태) */}
        {optimizedPrompt && (
          <details className="mb-4">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              생성에 사용된 프롬프트 보기
            </summary>
            <p className="mt-2 text-xs text-gray-500 bg-cream-50 p-3 rounded-lg font-mono">
              {optimizedPrompt}
            </p>
          </details>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1"
          >
            다시 생성
          </Button>
          <Button
            variant="primary"
            onClick={onContinue}
            disabled={isLoading}
            className="flex-1"
          >
            여행지 추천받기 →
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
