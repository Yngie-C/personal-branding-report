"use client";

import { motion } from "framer-motion";
import { Share2, Link2, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyButton from "./CopyButton";
import { getTwitterShareUrl, getLinkedInShareUrl, openShareWindow } from "@/lib/share/share-utils";

interface ShareOptionsProps {
  profileUrl: string;
  title?: string;
}

export default function ShareOptions({ profileUrl, title = "나의 브랜딩 프로필" }: ShareOptionsProps) {
  const handleTwitterShare = () => {
    const shareText = `${title}을 확인해보세요!`;
    const url = getTwitterShareUrl(shareText, profileUrl);
    openShareWindow(url, "twitter-share");
  };

  const handleLinkedInShare = () => {
    const url = getLinkedInShareUrl(profileUrl);
    openShareWindow(url, "linkedin-share");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Share2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">프로필 공유하기</h2>
          <p className="text-sm text-gray-500">웹 프로필을 공유하여 나를 알리세요</p>
        </div>
      </div>

      {/* 프로필 URL 복사 영역 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          프로필 링크
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 truncate">{profileUrl}</span>
          </div>
          <CopyButton
            text={profileUrl}
            variant="text"
            label="복사"
            size="md"
            className="shrink-0"
          />
        </div>
      </div>

      {/* SNS 공유 버튼들 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          SNS로 공유하기
        </label>
        <div className="flex flex-wrap gap-3">
          {/* Twitter/X */}
          <Button
            variant="outline"
            onClick={handleTwitterShare}
            className="flex items-center gap-2 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter / X</span>
          </Button>

          {/* LinkedIn */}
          <Button
            variant="outline"
            onClick={handleLinkedInShare}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
