'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface QuickReplyOption {
  label: string;
  value: string;
}

interface QuickReplyProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReply({
  options,
  onSelect,
  disabled = false,
}: QuickReplyProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, index) => (
        <motion.button
          key={option.value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            'bg-white border border-cream-300 text-gray-700',
            'hover:bg-sepia-50 hover:border-sepia-400 hover:text-sepia-700',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}
