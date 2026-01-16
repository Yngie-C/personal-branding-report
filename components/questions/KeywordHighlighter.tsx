'use client';

import { useMemo } from 'react';

interface KeywordHighlighterProps {
  /** The text to display with highlighted keywords */
  text: string;
  /** Array of keywords to highlight */
  keywords: string[];
  /** Optional custom highlight color (default: indigo) */
  highlightColor?: 'indigo' | 'purple' | 'blue' | 'green' | 'yellow';
  /** Optional className for the container */
  className?: string;
}

/**
 * KeywordHighlighter Component
 *
 * Highlights specified keywords within a text string.
 * Uses <mark> elements with customizable styling.
 *
 * @example
 * <KeywordHighlighter
 *   text="프로젝트 관리와 리더십 경험이 중요합니다."
 *   keywords={['프로젝트', '리더십']}
 *   highlightColor="indigo"
 * />
 */
export function KeywordHighlighter({
  text,
  keywords,
  highlightColor = 'indigo',
  className = '',
}: KeywordHighlighterProps) {
  // Color mappings for different highlight colors
  const colorStyles = {
    indigo: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    purple: 'bg-purple-100 border-purple-300 text-purple-900',
    blue: 'bg-blue-100 border-blue-300 text-blue-900',
    green: 'bg-green-100 border-green-300 text-green-900',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
  };

  const highlightClass = colorStyles[highlightColor];

  // Memoize the highlighted content to avoid unnecessary re-renders
  const highlightedContent = useMemo(() => {
    if (!keywords || keywords.length === 0) {
      return text;
    }

    // Create a regex pattern that matches any of the keywords (case-insensitive)
    const escapedKeywords = keywords.map((keyword) =>
      keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

    // Split text by keywords and create highlighted segments
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      // Check if this part is a keyword (case-insensitive)
      const isKeyword = keywords.some(
        (keyword) => keyword.toLowerCase() === part.toLowerCase()
      );

      if (isKeyword) {
        return (
          <mark
            key={index}
            className={`${highlightClass} border rounded px-1 py-0.5 mx-0.5 font-medium`}
          >
            {part}
          </mark>
        );
      }

      return part;
    });
  }, [text, keywords, highlightClass]);

  return <span className={className}>{highlightedContent}</span>;
}

/**
 * KeywordBadges Component
 *
 * Displays keywords as a list of badges.
 * Useful for showing matched keywords separately.
 *
 * @example
 * <KeywordBadges
 *   keywords={['프로젝트', '리더십', '혁신']}
 *   color="indigo"
 * />
 */
interface KeywordBadgesProps {
  keywords: string[];
  color?: 'indigo' | 'purple' | 'blue' | 'green' | 'yellow';
  size?: 'sm' | 'md';
  className?: string;
}

export function KeywordBadges({
  keywords,
  color = 'indigo',
  size = 'sm',
  className = '',
}: KeywordBadgesProps) {
  const colorStyles = {
    indigo: 'bg-indigo-100 border-indigo-200 text-indigo-700',
    purple: 'bg-purple-100 border-purple-200 text-purple-700',
    blue: 'bg-blue-100 border-blue-200 text-blue-700',
    green: 'bg-green-100 border-green-200 text-green-700',
    yellow: 'bg-yellow-100 border-yellow-200 text-yellow-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className={`${colorStyles[color]} ${sizeStyles[size]} border rounded-full font-medium`}
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}
