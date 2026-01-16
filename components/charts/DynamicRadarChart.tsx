'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading placeholder for charts
function ChartLoadingPlaceholder({ height = 350 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-slate-100/50 to-slate-200/50 rounded-2xl animate-pulse"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">차트 로딩 중...</p>
      </div>
    </div>
  );
}

// Dynamically import recharts components with no SSR
// This significantly reduces the initial bundle size since recharts is ~200KB
const DynamicRadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart as ComponentType<any>),
  {
    ssr: false,
    loading: () => <ChartLoadingPlaceholder />
  }
);

const DynamicRadar = dynamic(
  () => import('recharts').then((mod) => mod.Radar as ComponentType<any>),
  { ssr: false }
);

const DynamicPolarGrid = dynamic(
  () => import('recharts').then((mod) => mod.PolarGrid as ComponentType<any>),
  { ssr: false }
);

const DynamicPolarAngleAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarAngleAxis as ComponentType<any>),
  { ssr: false }
);

const DynamicPolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis as ComponentType<any>),
  { ssr: false }
);

const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer as ComponentType<any>),
  { ssr: false }
);

export {
  DynamicRadarChart,
  DynamicRadar,
  DynamicPolarGrid,
  DynamicPolarAngleAxis,
  DynamicPolarRadiusAxis,
  DynamicResponsiveContainer,
  ChartLoadingPlaceholder,
};
