'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIGuidanceProps {
  message: string;
  onComplete?: () => void;
  duration?: number; // milliseconds
}

/**
 * AI Guidance Component
 *
 * Displays AI guidance messages with smooth animation.
 * Auto-dismisses after the specified duration (default 3 seconds).
 *
 * @param message - The guidance message to display
 * @param onComplete - Callback when the guidance completes (after auto-dismiss)
 * @param duration - Display duration in milliseconds (default 3000)
 */
export function AIGuidance({ message, onComplete, duration = 3000 }: AIGuidanceProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false);

      // Call onComplete after exit animation completes
      setTimeout(() => {
        onComplete?.();
      }, 500); // Match exit animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="flex-shrink-0"
              >
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </motion.div>

              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900 mb-1">
                  AI 가이드
                </p>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="mt-3 h-1 bg-indigo-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{
                  duration: duration / 1000,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
