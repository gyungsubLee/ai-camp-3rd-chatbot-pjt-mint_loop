'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CONCEPTS } from '@/lib/constants/concepts';
import { Badge } from '@/components/ui/Badge';

export function ConceptPreview() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4">3 Aesthetic Concepts</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
              당신의 여행 컨셉을 선택하세요
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              세 가지 감성 컨셉 중 하나를 선택하면,
              <br className="hidden md:block" />
              그에 맞는 장소와 스타일을 큐레이션해드립니다.
            </p>
          </motion.div>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {CONCEPTS.map((concept, index) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link href={`/concept?selected=${concept.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-cream-50 border border-cream-200 hover:border-sepia-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                  {/* Concept Color Bar */}
                  <div
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, ${concept.colorPalette[0]}, ${concept.colorPalette[1]})`,
                    }}
                  />

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="font-serif text-2xl text-gray-900 mb-1">
                      {concept.nameKo}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{concept.name}</p>

                    {/* Tagline */}
                    <p className="text-sepia-600 font-medium mb-4 italic">
                      &ldquo;{concept.tagline}&rdquo;
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {concept.description}
                    </p>

                    {/* Recommended Films */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {concept.recommendedFilms.slice(0, 2).map((film) => (
                        <Badge key={film} variant="secondary" size="sm">
                          🎞️ {film}
                        </Badge>
                      ))}
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
                      {concept.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs text-gray-400 capitalize"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sepia-600 text-xl">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sepia-600 hover:text-sepia-700 font-medium transition-colors"
          >
            AI와 대화하며 나만의 컨셉 찾기
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
