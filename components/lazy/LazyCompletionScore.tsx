'use client';

import dynamic from 'next/dynamic';

// Dynamically import CompletionScore component
// This is shown in the question card, lazy loading reduces initial bundle
const LazyCompletionScore = dynamic(
  () => import('@/components/questions/CompletionScore').then((mod) => mod.CompletionScore),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center gap-1">
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-12 h-5 bg-gray-100 rounded-full animate-pulse" />
      </div>
    ),
  }
);

// Also export lazy versions of related components
const LazyCompletionScoreInline = dynamic(
  () => import('@/components/questions/CompletionScore').then((mod) => mod.CompletionScoreInline),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gray-100 animate-pulse">
        <div className="w-10 h-4 bg-gray-200 rounded" />
        <div className="w-8 h-4 bg-gray-200 rounded" />
      </div>
    ),
  }
);

const LazyScoreProgressBar = dynamic(
  () => import('@/components/questions/CompletionScore').then((mod) => mod.ScoreProgressBar),
  {
    ssr: false,
    loading: () => (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          <div className="w-10 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-8 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse" />
      </div>
    ),
  }
);

export { LazyCompletionScore, LazyCompletionScoreInline, LazyScoreProgressBar };
