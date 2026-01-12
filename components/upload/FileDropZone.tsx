"use client";

import { useState, useCallback, DragEvent, ChangeEvent, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];  // [".pdf", ".docx"]
  maxSizeMB?: number;
  disabled?: boolean;
  selectedFile?: File | null;
  className?: string;
}

export default function FileDropZone({
  onFileSelect,
  acceptedTypes = [".pdf", ".docx"],
  maxSizeMB = 10,
  disabled = false,
  selectedFile = null,
  className,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // 파일 타입 검증
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      return `지원하지 않는 파일 형식입니다. ${acceptedTypes.join(', ')} 파일만 업로드 가능합니다.`;
    }

    // 파일 크기 검증
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`;
    }

    return null;
  }, [acceptedTypes, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging && !disabled
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          error && "border-red-300 bg-red-50"
        )}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <FileText className="w-12 h-12 text-blue-600 mx-auto" />
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            {!disabled && (
              <p className="text-xs text-blue-600">클릭하여 다른 파일 선택</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className={cn(
              "w-12 h-12 mx-auto transition-colors",
              isDragging ? "text-blue-500" : "text-gray-400"
            )} />
            <div>
              <p className="font-medium text-gray-700">
                {isDragging ? "여기에 놓으세요" : "파일을 드래그하거나 클릭하세요"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF 또는 DOCX (최대 {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
