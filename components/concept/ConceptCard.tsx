'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ConceptData } from '@/lib/constants/concepts';

interface ConceptCardProps {
  concept: ConceptData;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConceptCard({ concept, isSelected, onSelect }: ConceptCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer',
        isSelected
          ? 'border-sepia-500 shadow-xl ring-4 ring-sepia-100'
          : 'border-cream-200 hover:border-sepia-300 hover:shadow-lg'
      )}
      onClick={onSelect}
    >
      {/* Color Bar */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${concept.colorPalette[0]}, ${concept.colorPalette[1]}, ${concept.colorPalette[2]})`,
        }}
      />

      {/* Content */}
      <div className="p-6 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif text-2xl text-gray-900">
                {concept.nameKo}
              </h3>
              {isSelected && (
                <Badge variant="success" size="sm">
                  ✓ 선택됨
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{concept.name}</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sepia-600 font-medium italic mb-4">
          &ldquo;{concept.tagline}&rdquo;
        </p>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          {concept.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <h4 className="text-xs text-gray-500 mb-2">추천 필름</h4>
            <div className="flex flex-wrap gap-1">
              {concept.recommendedFilms.map((film) => (
                <Badge key={film} variant="secondary" size="sm">
                  🎞️ {film.split(' ')[1]}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-gray-500 mb-2">추천 카메라</h4>
            <div className="flex flex-wrap gap-1">
              {concept.cameraModels.slice(0, 2).map((camera) => (
                <Badge key={camera} variant="secondary" size="sm">
                  📷 {camera.split(' ')[0]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Outfit Style */}
        <div className="mb-5">
          <h4 className="text-xs text-gray-500 mb-2">스타일 방향</h4>
          <p className="text-sm text-gray-700">{concept.outfitStyle}</p>
        </div>

        {/* Color Palette */}
        <div className="mb-5">
          <h4 className="text-xs text-gray-500 mb-2">컬러 팔레트</h4>
          <div className="flex gap-2">
            {concept.colorPalette.map((color, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-lg border border-cream-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-5">
          {concept.keywords.map((keyword) => (
            <span
              key={keyword}
              className="text-xs text-gray-400 capitalize"
            >
              #{keyword}
            </span>
          ))}
        </div>

        {/* Select Button */}
        <Button
          variant={isSelected ? 'primary' : 'outline'}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? '✓ 선택됨' : '이 컨셉 선택하기'}
        </Button>
      </div>
    </motion.div>
  );
}
