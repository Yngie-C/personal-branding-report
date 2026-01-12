"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResumeFormInput } from "@/types/resume-form";
import { User, Briefcase, Code, CheckCircle } from "lucide-react";

interface ParsedPreviewProps {
  parsedData: ResumeFormInput | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;     // 폼 탭으로 전환하여 수정
  onConfirm: () => void;  // 그대로 진행
}

export default function ParsedPreview({
  parsedData,
  isOpen,
  onClose,
  onEdit,
  onConfirm,
}: ParsedPreviewProps) {
  if (!parsedData) return null;

  const hasName = parsedData.personalInfo?.name && parsedData.personalInfo.name.trim() !== '';
  const experienceCount = parsedData.experiences?.filter(exp => exp.company).length || 0;
  const skillCount = parsedData.skills?.filter(skill => skill.trim() !== '').length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            이력서 분석 완료
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            AI가 이력서에서 다음 정보를 추출했습니다. 검토 후 진행해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 이름 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">이름</p>
              <p className="text-gray-900">
                {hasName ? parsedData.personalInfo.name : "(입력되지 않음)"}
              </p>
            </div>
          </div>

          {/* 경력 요약 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">경력사항</p>
              {experienceCount > 0 ? (
                <ul className="mt-1 space-y-1">
                  {parsedData.experiences.slice(0, 3).map((exp, idx) => (
                    exp.company && (
                      <li key={idx} className="text-sm text-gray-900">
                        {exp.company} - {exp.role || "(직책 미입력)"}
                      </li>
                    )
                  ))}
                  {experienceCount > 3 && (
                    <li className="text-sm text-gray-500">
                      외 {experienceCount - 3}개
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">(추출된 경력 없음)</p>
              )}
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {experienceCount}개
            </span>
          </div>

          {/* 스킬 요약 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Code className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">핵심 역량/기술</p>
              {skillCount > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.skills.slice(0, 5).map((skill, idx) => (
                    skill.trim() && (
                      <span
                        key={idx}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    )
                  ))}
                  {skillCount > 5 && (
                    <span className="text-xs text-gray-500">+{skillCount - 5}</span>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">(추출된 스킬 없음)</p>
              )}
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {skillCount}개
            </span>
          </div>

          {/* 안내 메시지 */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-medium">팁:</span> 추출된 정보가 정확하지 않다면
              &quot;수정하고 진행&quot;을 눌러 직접 수정할 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={onEdit}>
            수정하고 진행
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            그대로 진행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
