'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Camera, Film } from 'lucide-react';
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
      animate={{
        scale: isSelected ? 0.95 : 1,
      }}
      whileHover={!isSelected ? { y: -6 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative rounded-2xl overflow-hidden transition-shadow duration-300 cursor-pointer w-[300px] h-[520px] flex flex-col flex-shrink-0',
        isSelected
          ? 'ring-4 ring-sepia-400 shadow-2xl bg-sepia-50'
          : 'shadow-lg hover:shadow-xl'
      )}
      onClick={onSelect}
    >
      {/* Film Type Header */}
      <div className={cn(
        'px-4 py-3 flex items-center justify-between flex-shrink-0',
        isSelected ? 'bg-sepia-600' : 'bg-gray-900'
      )}>
        <div className="flex items-center gap-2">
          <Film className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-sepia-400')} />
          <span className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-sepia-400')}>
            {concept.filmType}
          </span>
        </div>
        {isSelected && (
          <span className="text-xs text-white font-medium bg-white/20 px-2 py-0.5 rounded-full">
            ✓ 선택됨
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-5 bg-white overflow-hidden">
        {/* Title Section */}
        <div className="mb-3 pb-3 border-b border-cream-100 flex-shrink-0">
          <h3 className="font-serif text-xl text-gray-900 mb-0.5 truncate">
            {concept.nameKo}
          </h3>
          <p className="text-xs text-gray-400 mb-1">{concept.name}</p>
          <p className="text-sepia-600 font-medium text-sm truncate">
            "{concept.tagline}"
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-shrink-0">
          {concept.description}
        </p>

        {/* Film & Camera Info */}
        <div className="space-y-3 mb-4 flex-shrink-0">
          {/* Film */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0">
              <Film className="w-3.5 h-3.5 text-sepia-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-0.5">추천 필름</p>
              <p className="text-xs text-gray-700 truncate">
                {concept.recommendedFilms[0]}
              </p>
            </div>
          </div>

          {/* Camera */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0">
              <Camera className="w-3.5 h-3.5 text-sepia-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-0.5">추천 카메라</p>
              <p className="text-xs text-gray-700 truncate">
                {concept.cameraModels[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Style */}
        <div className="mb-3 flex-shrink-0">
          <p className="text-[10px] text-gray-400 mb-1">스타일</p>
          <div className="p-2.5 bg-cream-50 rounded-lg">
            <p className="text-xs text-gray-600 line-clamp-2">{concept.outfitStyle}</p>
          </div>
        </div>

        {/* Keywords */}
        <div className="mb-4 flex-shrink-0">
          <p className="text-[10px] text-gray-400 mb-1.5">키워드</p>
          <div className="flex flex-wrap gap-1 h-[40px] overflow-hidden">
            {concept.keywords.slice(0, 4).map((keyword) => (
              <Badge key={keyword} variant="secondary" size="sm" className="text-xs">
                #{keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Select Button */}
        <div className="mt-auto flex-shrink-0">
          <Button
            variant={isSelected ? 'primary' : 'outline'}
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? '✓ 선택 완료' : '이 컨셉 선택'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
