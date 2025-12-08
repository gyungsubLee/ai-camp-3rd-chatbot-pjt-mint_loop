'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { getConceptById } from '@/lib/constants/concepts';
import { ImageGenerationForm } from '@/components/generate/ImageGenerationForm';
import { ImageGenerationModal } from '@/components/generate/ImageGenerationModal';
import { Badge } from '@/components/ui/Badge';

interface GenerationResult {
  imageUrl: string;
  optimizedPrompt: string;
  destination: string;
  filmStock: string;
}

type ModalStatus = 'loading' | 'success' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const {
    selectedConcept,
    preferences,
    tripKitProfile,
    chatMessages,
    addGeneratedImage,
    setImageGenerationContext,
  } = useVibeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<ModalStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [currentFormData, setCurrentFormData] = useState<{
    destination: string;
    additionalPrompt: string;
    selectedFilm: string;
  } | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // tripKitProfile에서 concept 가져오기 (우선) 또는 selectedConcept 사용
  const conceptId = tripKitProfile.conceptId || selectedConcept;
  const concept = conceptId ? getConceptById(conceptId) : null;

  // tripKitProfile 데이터가 없으면 chat 페이지로 리다이렉트
  useEffect(() => {
    const hasProfile = tripKitProfile.city && tripKitProfile.spotName;
    if (!hasProfile && !selectedConcept) {
      router.push('/chat');
    }
  }, [tripKitProfile, selectedConcept, router]);

  const handleGenerate = async (formData: {
    destination: string;
    additionalPrompt: string;
    selectedFilm: string;
  }) => {
    if (!concept) return;

    // 모달 열고 로딩 상태로 시작
    setCurrentFormData(formData);
    setIsModalOpen(true);
    setModalStatus('loading');
    setError(null);
    setResult(null);

    // tripKitProfile 데이터 우선 사용 (대화에서 수집한 정보)
    const outfitStyle = tripKitProfile.outfitStyle || concept.outfitStyle;
    const posePreference = tripKitProfile.posePreference || '';
    const filmType = tripKitProfile.filmType || concept.filmType;
    const cameraModel = tripKitProfile.cameraModel || '';
    const mainActionText = tripKitProfile.mainAction || '';
    const spotName = tripKitProfile.spotName || '';

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
          filmType: filmType,
          filmStyleDescription: concept.filmStyleDescription,
          outfitStyle: outfitStyle,
          additionalPrompt: formData.additionalPrompt,
          // 대화에서 수집한 전체 컨텍스트 (모든 정보 포함)
          chatContext: {
            city: tripKitProfile.city,
            spotName: spotName,
            mainAction: mainActionText,
            outfitStyle: outfitStyle,
            posePreference: posePreference,
            filmType: filmType,
            cameraModel: cameraModel,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Image generation failed');
      }

      const generationResult = {
        imageUrl: data.imageUrl,
        optimizedPrompt: data.optimizedPrompt,
        destination: formData.destination,
        filmStock: formData.selectedFilm,
      };

      setResult(generationResult);
      setModalStatus('success');

      // Store에 생성된 이미지 저장
      addGeneratedImage(formData.destination, data.imageUrl);

      // 이미지 생성 컨텍스트 저장 (destinations 추천에 활용)
      setImageGenerationContext({
        destination: formData.destination,
        additionalPrompt: formData.additionalPrompt,
        filmStock: formData.selectedFilm,
        outfitStyle: concept.outfitStyle,
      });
    } catch (err) {
      console.error('Generation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the image'
      );
      setModalStatus('error');
    }
  };

  const handleRegenerate = () => {
    if (currentFormData) {
      handleGenerate(currentFormData);
    }
  };

  const handleContinue = () => {
    setIsModalOpen(false);
    router.push('/destinations');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // tripKitProfile 또는 preferences에서 데이터 가져오기
  const destination = tripKitProfile.city && tripKitProfile.spotName
    ? `${tripKitProfile.city} ${tripKitProfile.spotName}`
    : preferences.travelDestination || '';
  const mainAction = tripKitProfile.mainAction || preferences.travelScene || '';

  if (!concept) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">먼저 대화를 완료해주세요</p>
          <Link href="/chat" className="text-sepia-600 hover:underline">
            대화 시작하기 →
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
              {tripKitProfile.filmType && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {tripKitProfile.filmType}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* TripKit Profile Summary */}
        {tripKitProfile.city && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white rounded-2xl border border-cream-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">대화에서 수집한 정보</h3>
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className="text-sm text-sepia-600 hover:underline"
              >
                {showChatHistory ? '대화 숨기기' : '대화 보기'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">도시:</span> {tripKitProfile.city}</div>
              <div><span className="text-gray-500">장소:</span> {tripKitProfile.spotName}</div>
              <div><span className="text-gray-500">장면:</span> {tripKitProfile.mainAction}</div>
              <div><span className="text-gray-500">컨셉:</span> {tripKitProfile.conceptId}</div>
              <div><span className="text-gray-500">의상:</span> {tripKitProfile.outfitStyle}</div>
              <div><span className="text-gray-500">포즈:</span> {tripKitProfile.posePreference}</div>
              <div><span className="text-gray-500">필름:</span> {tripKitProfile.filmType}</div>
              <div><span className="text-gray-500">카메라:</span> {tripKitProfile.cameraModel}</div>
            </div>

            {/* Chat History */}
            {showChatHistory && chatMessages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-cream-200 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">대화 기록</h4>
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-sm p-2 rounded ${
                        msg.role === 'user'
                          ? 'bg-sepia-50 text-right'
                          : 'bg-gray-50 text-left'
                      }`}
                    >
                      <span className="text-xs text-gray-400 block mb-1">
                        {msg.role === 'user' ? '나' : 'Trip Kit'}
                      </span>
                      {msg.content.slice(0, 100)}
                      {msg.content.length > 100 && '...'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3">
            당신의 여행을 미리 만나보세요
          </h2>
          {mainAction ? (
            <div className="space-y-2">
              <p className="text-gray-600 max-w-lg mx-auto">
                대화에서 말씀하신 <strong>&ldquo;{mainAction}&rdquo;</strong>를
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

        {/* 입력 폼 - 항상 표시 */}
        <ImageGenerationForm
          concept={concept}
          onGenerate={handleGenerate}
          isLoading={isModalOpen && modalStatus === 'loading'}
          initialDestination={destination}
          initialAdditionalPrompt={mainAction}
          initialFilm={tripKitProfile.filmType}
        />

        {/* 이전 생성 결과 미리보기 (모달 닫힌 후) */}
        {result && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-white rounded-2xl border border-cream-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={result.imageUrl}
                  alt="Generated"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  마지막 생성: <strong>{result.destination}</strong>
                </p>
                <p className="text-xs text-gray-400">{result.filmStock}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sepia-600 text-sm hover:underline"
              >
                다시 보기
              </button>
            </div>
          </motion.div>
        )}

        {/* 네비게이션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            href="/chat"
            className="text-sm text-gray-500 hover:text-sepia-600 transition-colors"
          >
            ← 대화 다시 시작하기
          </Link>
        </motion.div>
      </main>

      {/* Image Generation Modal */}
      {currentFormData && (
        <ImageGenerationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          status={modalStatus}
          concept={concept}
          destination={currentFormData.destination}
          filmStock={currentFormData.selectedFilm}
          imageUrl={result?.imageUrl}
          optimizedPrompt={result?.optimizedPrompt}
          errorMessage={error || undefined}
          onRegenerate={handleRegenerate}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
