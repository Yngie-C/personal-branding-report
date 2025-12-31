"use client";

import { useState } from "react";
import { Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onError: (message: string) => void;
}

export default function PortfolioFileUpload({ sessionId, onComplete, onError }: Props) {
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileUpload = async () => {
    if (!portfolioFile && !portfolioUrl) {
      onComplete(); // 선택사항이므로 건너뛰기
      return;
    }

    setLoading(true);

    try {
      if (portfolioFile) {
        const formData = new FormData();
        formData.append('file', portfolioFile);
        formData.append('sessionId', sessionId);
        formData.append('fileType', 'portfolio');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '파일 업로드에 실패했습니다.');
        }

        setUploaded(true);
        onComplete();
      } else if (portfolioUrl) {
        // TODO: URL 처리 로직 (현재 미구현)
        // 일단 완료 처리
        setUploaded(true);
        onComplete();
      }
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
          {portfolioFile ? (
            <div>
              <Image className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">{portfolioFile.name}</p>
              <p className="text-sm text-gray-500">
                {(portfolioFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {uploaded && (
                <p className="text-green-600 text-sm mt-2">✓ 업로드 완료</p>
              )}
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">클릭하여 파일 선택</p>
              <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (최대 10MB)</p>
            </div>
          )}
        </div>
      </label>

      <div className="text-center text-gray-500 text-sm">또는</div>

      <Input
        type="url"
        value={portfolioUrl}
        onChange={(e) => setPortfolioUrl(e.target.value)}
        placeholder="포트폴리오 URL (예: Notion, Behance, GitHub)"
      />

      {(portfolioFile || portfolioUrl) && (
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "업로드 중..." : "포트폴리오 업로드"}
        </button>
      )}

      {!portfolioFile && !portfolioUrl && (
        <button
          type="button"
          onClick={() => onComplete()}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          포트폴리오 건너뛰기
        </button>
      )}
    </div>
  );
}
