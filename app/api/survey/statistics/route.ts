import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 캐시 설정: 1시간 동안 재검증
export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SECRET_KEY!
);

interface CategoryAverage {
  category: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  sampleCount: number;
}

interface StatisticsResponse {
  averages: {
    innovation: number;
    execution: number;
    influence: number;
    collaboration: number;
    resilience: number;
  };
  overallAverage: number;
  totalUsers: number;
  categoryDetails: CategoryAverage[];
}

// 기본 평균값 (데이터가 충분하지 않을 때 사용)
const DEFAULT_AVERAGES = {
  innovation: 68,
  execution: 67,
  influence: 70,
  collaboration: 68,
  resilience: 67,
};

export async function GET() {
  try {
    // brief_reports에서 카테고리별 평균 점수 계산
    const { data: reports, error } = await supabase
      .from("brief_reports")
      .select("scores")
      .not("scores", "is", null);

    if (error) {
      console.error("Failed to fetch statistics:", error);
      // 에러 시 기본값 반환
      return NextResponse.json({
        data: {
          averages: DEFAULT_AVERAGES,
          overallAverage: 68,
          totalUsers: 0,
          categoryDetails: [],
          isDefault: true,
        },
      });
    }

    // 데이터가 10명 미만이면 기본값 사용
    if (!reports || reports.length < 10) {
      return NextResponse.json({
        data: {
          averages: DEFAULT_AVERAGES,
          overallAverage: 68,
          totalUsers: reports?.length || 0,
          categoryDetails: [],
          isDefault: true,
        },
      });
    }

    // 카테고리별 점수 집계
    const categoryScores: Record<string, number[]> = {
      innovation: [],
      execution: [],
      influence: [],
      collaboration: [],
      resilience: [],
    };

    for (const report of reports) {
      const byCategory = report.scores?.byCategory;
      if (!byCategory || !Array.isArray(byCategory)) continue;

      for (const cat of byCategory) {
        if (cat.category && typeof cat.normalizedScore === "number") {
          categoryScores[cat.category]?.push(cat.normalizedScore);
        }
      }
    }

    // 평균 계산
    const averages: Record<string, number> = {};
    const categoryDetails: CategoryAverage[] = [];
    let totalSum = 0;
    let totalCount = 0;

    for (const [category, scores] of Object.entries(categoryScores)) {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const min = Math.min(...scores);
        const max = Math.max(...scores);

        averages[category] = Math.round(avg * 10) / 10;
        totalSum += avg;
        totalCount++;

        categoryDetails.push({
          category,
          avgScore: Math.round(avg * 10) / 10,
          minScore: Math.round(min * 10) / 10,
          maxScore: Math.round(max * 10) / 10,
          sampleCount: scores.length,
        });
      } else {
        // 데이터 없으면 기본값
        averages[category] = DEFAULT_AVERAGES[category as keyof typeof DEFAULT_AVERAGES] || 68;
      }
    }

    const overallAverage = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 68;

    const response: StatisticsResponse = {
      averages: {
        innovation: averages.innovation || DEFAULT_AVERAGES.innovation,
        execution: averages.execution || DEFAULT_AVERAGES.execution,
        influence: averages.influence || DEFAULT_AVERAGES.influence,
        collaboration: averages.collaboration || DEFAULT_AVERAGES.collaboration,
        resilience: averages.resilience || DEFAULT_AVERAGES.resilience,
      },
      overallAverage,
      totalUsers: reports.length,
      categoryDetails: categoryDetails.sort((a, b) => b.avgScore - a.avgScore),
    };

    // Add caching headers for CDN
    return NextResponse.json({ data: response }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Statistics API error:", error);
    return NextResponse.json({
      data: {
        averages: DEFAULT_AVERAGES,
        overallAverage: 68,
        totalUsers: 0,
        categoryDetails: [],
        isDefault: true,
      },
    });
  }
}
