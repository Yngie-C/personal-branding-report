'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIGuidance } from './AIGuidance';
import type { QuestionPhaseMetadata } from '@/types/brand';

interface FocusModeQuestionProps {
  question: {
    id: string;
    question: string;
    hint: string;
    required: boolean;
    questionType?: 'soul' | 'expertise' | 'edge' | 'legacy';
    aiGuidance?: string;
  };
  phaseMetadata: QuestionPhaseMetadata;
  currentIndex: number;
  totalQuestions: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
}

/**
 * Focus Mode Question Component
 *
 * Displays one question at a time with:
 * - Phase header (Philosophy/Expertise/Edge)
 * - Progress indicator
 * - AI guidance (shown after answering)
 * - Previous/Next navigation
 *
 * @param question - The current question object
 * @param phaseMetadata - Phase information (title, description, completion %)
 * @param currentIndex - Current question index (0-based)
 * @param totalQuestions - Total number of questions
 * @param answer - Current answer value
 * @param onAnswerChange - Callback when answer changes
 * @param onNext - Callback for next button
 * @param onPrevious - Callback for previous button
 * @param canGoNext - Whether next button is enabled
 * @param canGoPrevious - Whether previous button is enabled
 * @param isLastQuestion - Whether this is the last question
 */
export function FocusModeQuestion({
  question,
  phaseMetadata,
  currentIndex,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
}: FocusModeQuestionProps) {
  const [showGuidance, setShowGuidance] = useState(false);
  const [hasShownGuidance, setHasShownGuidance] = useState(false);

  const handleAnswerChange = (value: string) => {
    onAnswerChange(value);

    // Show AI guidance after first substantial input
    if (
      !hasShownGuidance &&
      question.aiGuidance &&
      value.trim().length > 20
    ) {
      setShowGuidance(true);
      setHasShownGuidance(true);
    }
  };

  const handleGuidanceComplete = () => {
    setShowGuidance(false);
  };

  // Phase colors
  const phaseColors = {
    philosophy: 'from-purple-600 to-indigo-600',
    expertise: 'from-blue-600 to-cyan-600',
    edge: 'from-indigo-600 to-purple-600',
  };

  const phaseColor = phaseColors[phaseMetadata.phase] || 'from-gray-600 to-gray-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden py-12">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Phase Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className={`bg-gradient-to-r ${phaseColor} rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {phaseMetadata.phaseTitle}
                </h2>
                <p className="text-white/90 text-sm">
                  {phaseMetadata.phaseDescription}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {phaseMetadata.completionPercentage}%
                </div>
                <div className="text-xs text-white/80">
                  브랜드 완성도
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${phaseMetadata.completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Question Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <span className="text-sm font-medium text-indigo-600">
            질문 {currentIndex + 1} / {totalQuestions}
          </span>
        </motion.div>

        {/* AI Guidance (shown after answering) */}
        {showGuidance && question.aiGuidance && (
          <AIGuidance
            message={question.aiGuidance}
            onComplete={handleGuidanceComplete}
            duration={3000}
          />
        )}

        {/* Question Card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/40 p-8 mb-6"
        >
          {/* Question Type Badge */}
          {question.questionType && (
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                question.questionType === 'soul'
                  ? 'bg-purple-100 text-purple-700'
                  : question.questionType === 'expertise'
                  ? 'bg-blue-100 text-blue-700'
                  : question.questionType === 'edge'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {question.questionType === 'soul' && '철학'}
                {question.questionType === 'expertise' && '전문성'}
                {question.questionType === 'edge' && '차별화'}
                {question.questionType === 'legacy' && '일반'}
              </span>
            </div>
          )}

          {/* Question Text */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {question.question}
            {question.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>

          {/* Hint */}
          {question.hint && (
            <div className="mb-6 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {question.hint}
              </p>
            </div>
          )}

          {/* Answer Textarea */}
          <div className="mb-6">
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="여기에 답변을 작성해주세요..."
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <div className="mt-2 text-right">
              <span className={`text-sm ${
                answer.trim().length < 20
                  ? 'text-gray-400'
                  : answer.trim().length < 50
                  ? 'text-blue-600'
                  : 'text-green-600'
              }`}>
                {answer.trim().length} 자
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              이전
            </Button>

            <Button
              onClick={onNext}
              disabled={!canGoNext}
              size="lg"
              className="flex items-center gap-2"
            >
              {isLastQuestion ? '완료' : '다음'}
              {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          <p>답변은 자동 저장됩니다. 언제든지 이전 질문으로 돌아갈 수 있어요.</p>
        </motion.div>
      </div>
    </div>
  );
}
