'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { ConceptData } from '@/lib/constants/concepts';

interface ImageGenerationFormProps {
  concept: ConceptData;
  onGenerate: (data: {
    destination: string;
    additionalPrompt: string;
    selectedFilm: string;
  }) => void;
  isLoading: boolean;
}

export function ImageGenerationForm({
  concept,
  onGenerate,
  isLoading,
}: ImageGenerationFormProps) {
  const [destination, setDestination] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedFilm, setSelectedFilm] = useState(concept.recommendedFilms[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onGenerate({
        destination: destination.trim(),
        additionalPrompt: additionalPrompt.trim(),
        selectedFilm,
      });
    }
  };

  const placeholderExamples = {
    flaneur: '예: 파리 몽마르트르의 카페 테라스',
    filmlog: '예: 제주도 협재 해변의 석양',
    midnight: '예: 뉴욕 그리니치 빌리지의 재즈 클럽',
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      {/* 컨셉 정보 표시 */}
      <div className="mb-6 pb-6 border-b border-cream-100">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="primary">{concept.nameKo}</Badge>
          <span className="text-sm text-gray-500 italic">&ldquo;{concept.tagline}&rdquo;</span>
        </div>
        <p className="text-sm text-gray-600">{concept.description}</p>
      </div>

      {/* 여행지 입력 */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          어디로 여행하시나요? *
        </label>
        <Input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={placeholderExamples[concept.id]}
          disabled={isLoading}
          className="w-full"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          구체적인 장소를 입력할수록 더 멋진 이미지가 생성됩니다
        </p>
      </div>

      {/* 추가 프롬프트 (옵션) */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          추가 묘사 (선택)
        </label>
        <textarea
          value={additionalPrompt}
          onChange={(e) => setAdditionalPrompt(e.target.value)}
          placeholder="예: 해질녘에 혼자 걷고 있는 모습, 카페에서 책을 읽는 순간..."
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-sepia-400 focus:ring-2 focus:ring-sepia-100 transition-all resize-none"
          rows={3}
        />
      </div>

      {/* 필름 스톡 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          필름 선택
        </label>
        <div className="flex flex-wrap gap-2">
          {concept.recommendedFilms.map((film) => (
            <button
              key={film}
              type="button"
              onClick={() => setSelectedFilm(film)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedFilm === film
                  ? 'bg-sepia-500 text-white shadow-md'
                  : 'bg-cream-100 text-gray-700 hover:bg-cream-200'
              }`}
            >
              {film}
            </button>
          ))}
        </div>
      </div>

      {/* 컬러 팔레트 미리보기 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          컬러 팔레트
        </label>
        <div className="flex gap-2">
          {concept.colorPalette.map((color, idx) => (
            <div
              key={idx}
              className="w-10 h-10 rounded-lg border border-cream-200 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!destination.trim() || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            이미지 생성 중...
          </span>
        ) : (
          '여행 이미지 생성하기'
        )}
      </Button>

      {isLoading && (
        <p className="text-center text-sm text-gray-500 mt-3">
          DALL-E 3가 {concept.nameKo} 감성의 여행 사진을 만들고 있어요...
        </p>
      )}
    </motion.form>
  );
}
