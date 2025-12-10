'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Vibe 분석',
    titleEn: 'Vibe Analysis',
    description:
      '자연스러운 대화를 통해 당신의 여행 감성을 분석합니다. 무드, 미학, 관심사를 종합해 완벽한 Vibe 프로필을 만들어요.',
    highlight: '5-7개의 질문으로 완성',
  },
  {
    icon: '📍',
    title: '숨겨진 스팟 발견',
    titleEn: 'Hidden Spots',
    description:
      '관광객들이 모르는 현지인들의 비밀 장소를 추천합니다. 포토제닉하고 인스타그래머블한 숨은 명소들.',
    highlight: '여행지당 5-10개 추천',
  },
  {
    icon: '📷',
    title: '필름 카메라 스타일링',
    titleEn: 'Film Aesthetic',
    description:
      '코닥, 후지, 일포드 등 필름 스톡에 맞는 카메라 세팅과 촬영 팁. 진정한 아날로그 감성을 담아보세요.',
    highlight: 'DALL-E 3 미리보기',
  },
  {
    icon: '👗',
    title: '완벽한 큐레이션',
    titleEn: 'Complete Curation',
    description:
      '장소에 어울리는 의상, 소품, 앵글까지. 여행의 모든 순간을 하나의 작품으로 만들어주는 완벽한 패키지.',
    highlight: '카메라 + 의상 + 소품',
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-24 px-6 bg-cream-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4">How It Works</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
              여행의 감성을 설계합니다
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Trip Kit은 단순한 여행 플래너가 아닙니다.
              <br />
              당신의 여행을 하나의 예술 작품으로 만들어드립니다.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-cream-200 hover:border-sepia-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-sepia-50 flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-serif text-xl text-gray-900">
                      {feature.title}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {feature.titleEn}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {feature.description}
                  </p>

                  <Badge variant="secondary" size="sm">
                    ✓ {feature.highlight}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-cream-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Flow Diagram */}
            <div className="flex-1 flex items-center justify-center gap-4 md:gap-6">
              {['💬 대화', '📍 장소', '📷 스타일', '✨ 완성'].map(
                (step, index, arr) => (
                  <div key={step} className="flex items-center gap-2 md:gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xl md:text-2xl mb-1">
                        {step.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {step.split(' ')[1]}
                      </span>
                    </div>
                    {index < arr.length - 1 && (
                      <span className="text-sepia-400 text-lg">→</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
