import type { Metadata } from 'next';
import { Libre_Baskerville, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trip Kit - 여행의 감성을 설계하는 AI 큐레이터',
  description:
    'AI가 당신의 여행 Vibe를 분석하여 숨겨진 장소, 필름 카메라 스타일, 완벽한 스타일링을 큐레이션합니다.',
  keywords: [
    'travel',
    'vibe',
    'film camera',
    'aesthetic',
    'hidden spots',
    'AI travel',
    '여행',
    '필름 카메라',
    '감성 여행',
  ],
  authors: [{ name: 'Trip Kit Team' }],
  openGraph: {
    title: 'Trip Kit - 여행의 감성을 설계하는 AI 큐레이터',
    description: '당신은 티켓만 끊으세요. 여행의 분위기는 우리가 챙겨드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${libreBaskerville.variable} ${inter.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
