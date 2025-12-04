'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHome ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md border-b border-cream-200'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <span className={cn(
              'font-serif text-xl font-bold',
              isHome ? 'text-gray-900' : 'text-gray-900'
            )}>
              Trip Kit
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/chat"
              className={cn(
                'text-sm font-medium transition-colors',
                isHome ? 'text-gray-700 hover:text-sepia-600' : 'text-gray-600 hover:text-sepia-600'
              )}
            >
              Vibe 찾기
            </Link>
            <Link
              href="/concept"
              className={cn(
                'text-sm font-medium transition-colors',
                isHome ? 'text-gray-700 hover:text-sepia-600' : 'text-gray-600 hover:text-sepia-600'
              )}
            >
              컨셉 둘러보기
            </Link>
          </nav>

          {/* CTA Button */}
          <Link
            href="/chat"
            className={cn(
              'hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isHome
                ? 'bg-sepia-600 text-white hover:bg-sepia-700'
                : 'bg-sepia-600 text-white hover:bg-sepia-700'
            )}
          >
            시작하기
          </Link>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-cream-100">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
