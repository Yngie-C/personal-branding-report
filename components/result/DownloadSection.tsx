"use client";

import { motion } from "framer-motion";
import { FileText, Presentation, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadSectionProps {
  textPdfUrl: string | null;
  slidesPdfUrl: string | null;
  pptxUrl: string | null;
}

interface DownloadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string | null;
  fileName: string;
  delay: number;
}

function DownloadCard({ title, description, icon, url, fileName, delay }: DownloadCardProps) {
  const isAvailable = !!url;

  const handleDownload = () => {
    if (!url) return;

    // 새 창에서 다운로드 시작
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`
        p-4 sm:p-5 rounded-xl border-2 transition-all
        ${isAvailable
          ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer'
          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}
      `}
      onClick={isAvailable ? handleDownload : undefined}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className={`
          p-3 rounded-lg shrink-0
          ${isAvailable ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}
        `}>
          {icon}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
            {description}
          </p>
        </div>

        {/* 다운로드 아이콘 */}
        {isAvailable && (
          <Download className="w-5 h-5 text-blue-600 shrink-0" />
        )}
      </div>

      {/* 비활성 메시지 */}
      {!isAvailable && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>파일을 준비 중입니다</span>
        </div>
      )}
    </motion.div>
  );
}

export default function DownloadSection({ textPdfUrl, slidesPdfUrl, pptxUrl }: DownloadSectionProps) {
  const downloads = [
    {
      title: "텍스트 리포트 (PDF)",
      description: "상세한 브랜드 전략과 콘텐츠가 담긴 8-12페이지 문서",
      icon: <FileText className="w-6 h-6" />,
      url: textPdfUrl,
      fileName: "branding-report.pdf",
      delay: 0.1,
    },
    {
      title: "슬라이드 덱 (PDF)",
      description: "프레젠테이션용 시각적 슬라이드 20+ 페이지",
      icon: <Presentation className="w-6 h-6" />,
      url: slidesPdfUrl,
      fileName: "branding-slides.pdf",
      delay: 0.2,
    },
    {
      title: "프레젠테이션 (PPTX)",
      description: "편집 가능한 PowerPoint 파일",
      icon: <Presentation className="w-6 h-6" />,
      url: pptxUrl,
      fileName: "branding-presentation.pptx",
      delay: 0.3,
    },
  ];

  // 하나라도 다운로드 가능한지 확인
  const hasAnyDownload = textPdfUrl || slidesPdfUrl || pptxUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        리포트 다운로드
      </h2>

      {hasAnyDownload ? (
        <div className="space-y-3">
          {downloads.map((download) => (
            <DownloadCard key={download.title} {...download} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>다운로드 가능한 파일이 없습니다.</p>
          <p className="text-sm mt-1">리포트 생성이 완료되면 다운로드 링크가 표시됩니다.</p>
        </div>
      )}

      {/* 전체 다운로드 버튼 (선택) */}
      {hasAnyDownload && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            파일을 클릭하면 다운로드가 시작됩니다
          </p>
        </div>
      )}
    </motion.div>
  );
}
