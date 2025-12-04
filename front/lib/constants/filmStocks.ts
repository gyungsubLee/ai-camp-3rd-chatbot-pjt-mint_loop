export interface FilmStockData {
  id: string;
  name: string;
  brand: string;
  iso: number;
  type: 'color' | 'bw';
  colorProfile: string;
  characteristics: string[];
  bestFor: string[];
  priceRange: '$' | '$$' | '$$$';
  sampleColor: string;
}

export const FILM_STOCKS: FilmStockData[] = [
  {
    id: 'kodak_colorplus',
    name: 'Kodak ColorPlus 200',
    brand: 'Kodak',
    iso: 200,
    type: 'color',
    colorProfile: '따뜻하고 채도가 높은 톤, 레드-오렌지 시프트',
    characteristics: [
      '가성비 좋음 (~$8/롤)',
      '다양한 조명에 적합',
      '여행과 풍경에 좋음',
      '골든아워에 완벽한 따뜻한 색감',
      '미세한 그레인 구조',
    ],
    bestFor: ['일몰', '인물', '여행', '골든아워'],
    priceRange: '$',
    sampleColor: '#E8D4B8',
  },
  {
    id: 'kodak_portra',
    name: 'Kodak Portra 400',
    brand: 'Kodak',
    iso: 400,
    type: 'color',
    colorProfile: '자연스러운 피부톤, 부드럽고 미묘한 색감',
    characteristics: [
      '뛰어난 피부톤 표현',
      '넓은 관용도',
      '부드러운 그레인',
      '전문가 선호',
      '다목적 사용 가능',
    ],
    bestFor: ['인물', '웨딩', '패션', '스튜디오'],
    priceRange: '$$$',
    sampleColor: '#D8D0C8',
  },
  {
    id: 'fuji_superia',
    name: 'Fujifilm Superia 400',
    brand: 'Fujifilm',
    iso: 400,
    type: 'color',
    colorProfile: '생생하고 채도 높은 색상, 그린-블루 강조',
    characteristics: [
      '선명하고 펀치있는 색감',
      '빠른 셔터스피드 가능',
      '다양한 조명 조건에 적합',
      '쿨톤 경향',
      '적당한 가격',
    ],
    bestFor: ['일상', '거리', '자연', '스냅'],
    priceRange: '$$',
    sampleColor: '#C8D4D8',
  },
  {
    id: 'ilford_hp5',
    name: 'Ilford HP5 Plus 400',
    brand: 'Ilford',
    iso: 400,
    type: 'bw',
    colorProfile: '클래식 흑백, 높은 대비, 유기적인 그레인',
    characteristics: [
      '클래식한 흑백 미학',
      '넓은 관용도',
      '푸시/풀 현상에 적합',
      '드라마틱한 대비',
      '유기적인 그레인 텍스처',
    ],
    bestFor: ['스트릿 포토', '건축', '드라마틱 인물', '저조도'],
    priceRange: '$$',
    sampleColor: '#B0B0B0',
  },
];

export function getFilmStockById(id: string): FilmStockData | undefined {
  return FILM_STOCKS.find((film) => film.id === id);
}

export function getFilmStocksByType(type: 'color' | 'bw'): FilmStockData[] {
  return FILM_STOCKS.filter((film) => film.type === type);
}
