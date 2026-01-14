import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import QuestionsContent from "./questions-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="text-center relative z-10">
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
