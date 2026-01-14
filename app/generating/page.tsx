import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GeneratingContent from "./generating-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin relative z-10" />
    </main>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratingContent />
    </Suspense>
  );
}
