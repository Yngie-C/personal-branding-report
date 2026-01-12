"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface ResultPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ResultPageHeader({
  title = "브랜딩 리포트 완성!",
  subtitle = "리포트를 다운로드하여 나만의 브랜드 전략을 확인하세요",
}: ResultPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
    >
      <div className="text-center">
        {/* 성공 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        {/* 제목 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-500" />
          {title}
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </motion.h1>

        {/* 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-600"
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
}
