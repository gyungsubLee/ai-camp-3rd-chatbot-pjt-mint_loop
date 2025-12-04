'use client';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center text-base">
        📷
      </div>

      {/* Typing Animation */}
      <div className="bg-white border border-cream-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
