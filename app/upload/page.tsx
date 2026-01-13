import { Suspense } from "react";
import UploadContent from "./upload-content";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">로딩 중...</div>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UploadContent />
    </Suspense>
  );
}
