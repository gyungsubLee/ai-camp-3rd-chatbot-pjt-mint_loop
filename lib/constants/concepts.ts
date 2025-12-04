export interface ConceptData {
  id: 'flaneur' | 'filmlog' | 'midnight';
  name: string;
  nameKo: string;
  tagline: string;
  description: string;
  image: string;
  sampleImages: string[];
  recommendedFilms: string[];
  cameraModels: string[];
  outfitStyle: string;
  colorPalette: string[];
  keywords: string[];
}

export const CONCEPTS: ConceptData[] = [
  {
    id: 'flaneur',
    name: 'Flâneur',
    nameKo: '플라뇌르',
    tagline: '지도 없이 걷는 낭만',
    description:
      '19세기 파리의 산책자처럼, 목적 없이 도시를 거닐며 발견하는 순간들. 책을 손에 들고 카페에 앉아 사람들을 관찰하고, 골목길에서 우연히 마주치는 아름다움을 기록합니다.',
    image: '/images/concepts/flaneur/hero.jpg',
    sampleImages: [
      '/images/concepts/flaneur/sample-1.jpg',
      '/images/concepts/flaneur/sample-2.jpg',
      '/images/concepts/flaneur/sample-3.jpg',
    ],
    recommendedFilms: ['Kodak Portra 400', 'Ilford HP5 Plus'],
    cameraModels: ['Leica M6', 'Contax G2', 'Olympus OM-1'],
    outfitStyle: '미니멀리스트 도시 스타일, 중성 톤',
    colorPalette: ['#2E2012', '#8B7355', '#D8D0C8', '#F5F5F5'],
    keywords: ['urban', 'literary', 'cafe', 'street', 'intellectual'],
  },
  {
    id: 'filmlog',
    name: 'Film Log',
    nameKo: '필름 로그',
    tagline: '빈티지 감성 기록',
    description:
      '따뜻한 햇살 아래 필름 카메라를 들고, 일상의 순간들을 빈티지 감성으로 담아냅니다. 레트로 카페, 오래된 서점, 그리고 골목 사이로 스며드는 오후의 빛.',
    image: '/images/concepts/filmlog/hero.jpg',
    sampleImages: [
      '/images/concepts/filmlog/sample-1.jpg',
      '/images/concepts/filmlog/sample-2.jpg',
      '/images/concepts/filmlog/sample-3.jpg',
    ],
    recommendedFilms: ['Kodak ColorPlus 200', 'Fujifilm Superia 400'],
    cameraModels: ['Canon AE-1', 'Pentax K1000', 'Nikon FM2'],
    outfitStyle: '레트로 캐주얼, 따뜻한 컬러',
    colorPalette: ['#E8D4B8', '#C4894D', '#8B7355', '#F9EFE7'],
    keywords: ['vintage', 'warm', 'nostalgic', 'golden hour', 'retro'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    nameKo: '미드나잇',
    tagline: '과거 예술가와의 조우',
    description:
      '밤의 도시를 걷는 예술적 시간 여행. 1920년대 파리의 살롱, 헤밍웨이가 글을 쓰던 카페, 피카소가 그림을 그리던 골목. 보헤미안의 자유로운 영혼으로.',
    image: '/images/concepts/midnight/hero.jpg',
    sampleImages: [
      '/images/concepts/midnight/sample-1.jpg',
      '/images/concepts/midnight/sample-2.jpg',
      '/images/concepts/midnight/sample-3.jpg',
    ],
    recommendedFilms: ['Kodak Tri-X 400', 'Ilford Delta 3200'],
    cameraModels: ['Hasselblad 500C/M', 'Rolleiflex', 'Mamiya 7'],
    outfitStyle: '아티스틱, 드라마틱, 레이어드 텍스처',
    colorPalette: ['#1a1a2e', '#543A1D', '#A67035', '#E3C4A9'],
    keywords: ['artistic', 'bohemian', 'dramatic', 'night', 'cultural'],
  },
];

export function getConceptById(id: string): ConceptData | undefined {
  return CONCEPTS.find((concept) => concept.id === id);
}
