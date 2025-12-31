/**
 * Card Component v2
 * Variant 시스템을 활용한 재사용 가능한 카드 컴포넌트
 * Figma 템플릿의 다양한 카드 스타일을 구현
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl transition-all duration-200",
  {
    variants: {
      variant: {
        // 기본 카드 - 흰색 배경 + 그림자 + 테두리
        elevated: "bg-white shadow-md border border-slate-200 hover:shadow-lg",

        // 테두리만 있는 카드
        outlined: "bg-white border-2 border-slate-300 hover:border-slate-400",

        // 유리형태 카드 (Glassmorphism) - Hero 섹션용
        glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl",

        // 다크 카드 - 어두운 배경용
        dark: "bg-white/10 backdrop-blur-sm border border-white/20 text-white",

        // 강조 카드 - Navy 배경
        accent: "bg-navy-600 text-white shadow-lg hover:bg-navy-700",

        // Flat 카드 - 그림자 없음
        flat: "bg-white border border-slate-200",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "md",
      hover: "none",
    },
  }
);

export interface CardV2Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const CardV2 = React.forwardRef<HTMLDivElement, CardV2Props>(
  ({ className, variant, size, hover, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardVariants({ variant, size, hover }), className)}
        {...props}
      />
    );
  }
);
CardV2.displayName = "CardV2";

// Card Header
export interface CardHeaderV2Props extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeaderV2 = React.forwardRef<HTMLDivElement, CardHeaderV2Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
CardHeaderV2.displayName = "CardHeaderV2";

// Card Title
export interface CardTitleV2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitleV2 = React.forwardRef<HTMLHeadingElement, CardTitleV2Props>(
  ({ className, as: Component = "h3", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitleV2.displayName = "CardTitleV2";

// Card Description
export interface CardDescriptionV2Props extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescriptionV2 = React.forwardRef<HTMLParagraphElement, CardDescriptionV2Props>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescriptionV2.displayName = "CardDescriptionV2";

// Card Content
export interface CardContentV2Props extends React.HTMLAttributes<HTMLDivElement> {}

const CardContentV2 = React.forwardRef<HTMLDivElement, CardContentV2Props>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContentV2.displayName = "CardContentV2";

// Card Footer
export interface CardFooterV2Props extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooterV2 = React.forwardRef<HTMLDivElement, CardFooterV2Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-6", className)}
      {...props}
    />
  )
);
CardFooterV2.displayName = "CardFooterV2";

export {
  CardV2,
  CardHeaderV2,
  CardTitleV2,
  CardDescriptionV2,
  CardContentV2,
  CardFooterV2,
};
