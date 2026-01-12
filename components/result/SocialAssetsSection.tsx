"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Download, Image, Linkedin, Twitter, Instagram, CreditCard } from "lucide-react";

interface SocialAssets {
  linkedinBanner: string;
  linkedinProfile: string;
  businessCard: string;
  twitterHeader: string;
  instagramHighlight: string;
}

interface SocialAssetsSectionProps {
  assets: SocialAssets;
}

interface AssetCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  fileName: string;
}

function AssetCard({ title, description, icon, url, fileName }: AssetCardProps) {
  const isAvailable = !!url;

  const handleDownload = () => {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all
        ${isAvailable
          ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
          : 'bg-gray-50 opacity-50 cursor-not-allowed'}
      `}
      onClick={isAvailable ? handleDownload : undefined}
    >
      {/* 아이콘 */}
      <div className={`
        p-2 rounded-md shrink-0
        ${isAvailable ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-400'}
      `}>
        {icon}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {description}
        </p>
      </div>

      {/* 다운로드 버튼 */}
      {isAvailable && (
        <Download className="w-4 h-4 text-gray-400 hover:text-indigo-600 shrink-0" />
      )}
    </div>
  );
}

export default function SocialAssetsSection({ assets }: SocialAssetsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const assetItems = [
    {
      title: "LinkedIn 배너",
      description: "1200 x 627px",
      icon: <Linkedin className="w-4 h-4" />,
      url: assets.linkedinBanner,
      fileName: "linkedin-banner.png",
    },
    {
      title: "LinkedIn 프로필",
      description: "400 x 500px",
      icon: <Linkedin className="w-4 h-4" />,
      url: assets.linkedinProfile,
      fileName: "linkedin-profile.png",
    },
    {
      title: "명함 디자인",
      description: "표준 명함 사이즈",
      icon: <CreditCard className="w-4 h-4" />,
      url: assets.businessCard,
      fileName: "business-card.png",
    },
    {
      title: "Twitter/X 헤더",
      description: "1500 x 500px",
      icon: <Twitter className="w-4 h-4" />,
      url: assets.twitterHeader,
      fileName: "twitter-header.png",
    },
    {
      title: "Instagram 하이라이트",
      description: "1080 x 1080px",
      icon: <Instagram className="w-4 h-4" />,
      url: assets.instagramHighlight,
      fileName: "instagram-highlight.png",
    },
  ];

  // 사용 가능한 에셋 수
  const availableCount = assetItems.filter(item => !!item.url).length;

  // 에셋이 하나도 없으면 섹션 숨김
  if (availableCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
    >
      {/* 헤더 (클릭하여 확장/축소) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Image className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              소셜 미디어 에셋
            </h2>
            <p className="text-sm text-gray-500">
              {availableCount}개의 에셋 사용 가능
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* 확장 콘텐츠 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-gray-100">
              <div className="pt-4 space-y-2">
                {assetItems.map((item) => (
                  <AssetCard key={item.title} {...item} />
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                각 항목을 클릭하여 다운로드하세요
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
