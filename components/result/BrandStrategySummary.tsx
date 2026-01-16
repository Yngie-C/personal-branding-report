"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Users } from "lucide-react";
import CopyButton from "./CopyButton";

interface BrandStrategySummaryProps {
  brandStrategy: {
    brandEssence?: string;
    uniqueValueProposition?: string;
    targetAudience?: string[] | string;
  };
}

interface StrategyCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  iconBgColor: string;
  iconColor: string;
  delay: number;
}

function StrategyCard({ icon, title, content, iconBgColor, iconColor, delay }: StrategyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gray-50 rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`p-2 rounded-lg shrink-0 ${iconBgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <CopyButton text={content} size="sm" variant="icon" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function BrandStrategySummary({ brandStrategy }: BrandStrategySummaryProps) {
  const { brandEssence, uniqueValueProposition, targetAudience } = brandStrategy;

  // 데이터가 하나도 없으면 null 반환
  if (!brandEssence && !uniqueValueProposition && !targetAudience) {
    return null;
  }

  // targetAudience 문자열 변환
  const audienceText = Array.isArray(targetAudience)
    ? targetAudience.join(", ")
    : targetAudience || "";

  const cards = [
    {
      show: !!brandEssence,
      icon: <Sparkles className="w-5 h-5" />,
      title: "브랜드 에센스",
      content: brandEssence || "",
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      show: !!uniqueValueProposition,
      icon: <Target className="w-5 h-5" />,
      title: "핵심 가치 제안",
      content: uniqueValueProposition || "",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      show: !!audienceText,
      icon: <Users className="w-5 h-5" />,
      title: "타겟 오디언스",
      content: audienceText,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ].filter(card => card.show);

  if (cards.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">브랜드 전략 요약</h2>

      <div className="space-y-3">
        {cards.map((card, index) => (
          <StrategyCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            content={card.content}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        각 항목 우측의 복사 버튼으로 텍스트를 복사할 수 있습니다
      </p>
    </motion.div>
  );
}
