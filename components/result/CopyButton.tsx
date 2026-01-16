"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/share/share-utils";

interface CopyButtonProps {
  text: string;
  size?: "sm" | "md";
  variant?: "icon" | "text";
  label?: string;
  className?: string;
}

export default function CopyButton({
  text,
  size = "md",
  variant = "icon",
  label = "복사",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지

    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonPadding = size === "sm" ? "p-1.5" : "p-2";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (variant === "text") {
    return (
      <button
        onClick={handleCopy}
        className={`
          inline-flex items-center gap-1.5 ${buttonPadding} rounded-lg
          transition-all duration-200
          ${copied
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }
          ${className}
        `}
        title={copied ? "복사됨!" : label}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Check className={iconSize} />
              <span className={textSize}>복사됨</span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Copy className={iconSize} />
              <span className={textSize}>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }

  // Icon-only variant
  return (
    <button
      onClick={handleCopy}
      className={`
        ${buttonPadding} rounded-lg transition-all duration-200
        ${copied
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        }
        ${className}
      `}
      title={copied ? "복사됨!" : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
          >
            <Check className={iconSize} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className={iconSize} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
