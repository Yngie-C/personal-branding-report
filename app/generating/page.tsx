import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GeneratingContent from "./generating-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
