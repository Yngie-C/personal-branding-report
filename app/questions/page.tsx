import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import QuestionsContent from "./questions-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">맞춤형 질문을 준비하고 있습니다...</p>
      </div>
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuestionsContent />
    </Suspense>
  );
}
