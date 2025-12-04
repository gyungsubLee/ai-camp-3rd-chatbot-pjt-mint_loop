'use client';

import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMessageContent(content: string): string {
  // Convert **bold** to <strong>
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  return formatted;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%] message-appear',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base',
          isUser ? 'bg-sepia-100 text-sepia-700' : 'bg-cream-200 text-gray-700'
        )}
      >
        {isUser ? '👤' : '📷'}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-[15px] leading-relaxed',
            isUser
              ? 'bg-sepia-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-cream-200 rounded-bl-md shadow-sm'
          )}
        >
          <div
            className="prose prose-sm max-w-none prose-strong:font-semibold"
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(content),
            }}
          />
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            'text-xs text-gray-400',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
