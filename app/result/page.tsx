import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ResultContent from "./result-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">결과를 불러오는 중...</p>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultContent />
    </Suspense>
  );
}
