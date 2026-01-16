'use client';

import dynamic from 'next/dynamic';

// Dynamically import AIGuidance component
// This is shown only after user starts typing, so lazy loading is appropriate
const LazyAIGuidance = dynamic(
  () => import('@/components/questions/AIGuidance').then((mod) => mod.AIGuidance),
  {
    ssr: false,
    loading: () => (
      <div className="mb-6 animate-pulse">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-indigo-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-indigo-200 rounded w-20" />
              <div className="h-3 bg-indigo-100 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export { LazyAIGuidance };
