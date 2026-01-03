"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  featureName?: string;
}

export default function ComingSoon({
  title = "준비 중입니다",
  description = "이 기능은 현재 개발 중이며 곧 제공될 예정입니다.",
  featureName = "이 기능",
}: ComingSoonProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-12 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-purple-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        {/* Feature Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>{featureName} (Coming Soon)</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/survey-result")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            PSA 분석 결과 보기
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> PSA 분석 결과는 언제든 웹 프로필 링크로 공유할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
