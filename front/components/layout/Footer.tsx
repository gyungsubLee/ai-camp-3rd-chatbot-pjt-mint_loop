import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-2xl">📷</span>
              <span className="font-serif text-xl font-bold">Trip Kit</span>
            </div>
            <p className="text-gray-400 text-sm">
              여행의 감성을 설계하는 AI 큐레이터
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link
              href="/chat"
              className="text-gray-400 hover:text-white transition-colors"
            >
              시작하기
            </Link>
            <Link
              href="/concept"
              className="text-gray-400 hover:text-white transition-colors"
            >
              컨셉
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Trip Kit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
