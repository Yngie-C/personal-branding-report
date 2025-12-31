#!/usr/bin/env tsx
/**
 * Design Tokens Sync Script
 * Figma에서 디자인 토큰을 추출하여 globals.css 자동 업데이트
 *
 * Usage:
 *   npm run sync:design-tokens
 *
 * Requirements:
 *   - FIGMA_API_KEY 환경 변수 설정
 *   - FIGMA_TEMPLATE_KEY 환경 변수 설정 (복사한 템플릿의 fileKey)
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

// Figma MCP 도구는 실제로는 사용 불가 (서버 환경에서만 동작)
// 대신 Figma REST API 직접 사용

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
}

interface FigmaVariablesResponse {
  meta: {
    variables: Record<string, FigmaVariable>;
  };
}

async function fetchFigmaVariables(fileKey: string, apiKey: string): Promise<FigmaVariablesResponse | null> {
  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/variables/local`,
      {
        headers: {
          'X-Figma-Token': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`Figma API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Figma variables:', error);
    return null;
  }
}

function rgbaToHsl(r: number, g: number, b: number, a: number): string {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

function convertFigmaColorToCSS(color: any): string {
  if (color.r !== undefined) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;

    return rgbaToHsl(r, g, b, a);
  }
  return '0 0% 0%'; // fallback
}

function generateCSSVariables(variables: Record<string, FigmaVariable>): string {
  const cssVars: string[] = [];

  Object.values(variables).forEach(variable => {
    const name = variable.name.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-');
    const modeId = Object.keys(variable.valuesByMode)[0];
    const value = variable.valuesByMode[modeId];

    if (variable.resolvedType === 'COLOR') {
      const cssValue = convertFigmaColorToCSS(value);
      cssVars.push(`  --${name}: ${cssValue};`);
    } else if (variable.resolvedType === 'FLOAT') {
      cssVars.push(`  --${name}: ${value}rem;`);
    } else if (typeof value === 'string') {
      cssVars.push(`  --${name}: ${value};`);
    }
  });

  return cssVars.join('\n');
}

async function syncDesignTokens() {
  const apiKey = process.env.FIGMA_API_KEY;
  const templateKey = process.env.FIGMA_TEMPLATE_KEY;

  if (!apiKey) {
    console.error('❌ FIGMA_API_KEY not set in environment variables');
    console.log('\nPlease set your Figma Personal Access Token:');
    console.log('  export FIGMA_API_KEY=your_token_here');
    console.log('\nGet your token from: https://www.figma.com/settings');
    process.exit(1);
  }

  if (!templateKey) {
    console.error('❌ FIGMA_TEMPLATE_KEY not set in environment variables');
    console.log('\nPlease set your Figma file key:');
    console.log('  export FIGMA_TEMPLATE_KEY=your_file_key_here');
    console.log('\nFind it in your Figma file URL: https://figma.com/file/[FILE_KEY]/...');
    process.exit(1);
  }

  console.log('🔄 Fetching design tokens from Figma...');

  const data = await fetchFigmaVariables(templateKey, apiKey);

  if (!data || !data.meta.variables) {
    console.error('❌ Failed to fetch variables from Figma');
    console.log('\n💡 Alternative: Using local design tokens from lib/design-tokens.ts');
    process.exit(1);
  }

  console.log(`✅ Fetched ${Object.keys(data.meta.variables).length} variables from Figma`);

  // CSS Variables 생성
  const cssVars = generateCSSVariables(data.meta.variables);

  // globals.css 업데이트
  const globalsPath = path.join(process.cwd(), 'app', 'globals.css');
  const content = fs.readFileSync(globalsPath, 'utf-8');

  // :root { ... } 블록 교체
  const updatedContent = content.replace(
    /:root\s*\{[\s\S]*?\}/,
    `:root {\n${cssVars}\n}`
  );

  fs.writeFileSync(globalsPath, updatedContent, 'utf-8');

  console.log('✅ Design tokens synced to app/globals.css');
  console.log('\n📝 Next steps:');
  console.log('  1. Review the changes in globals.css');
  console.log('  2. Test the app: npm run dev');
  console.log('  3. Commit if satisfied: git add . && git commit -m "Update design tokens from Figma"');
}

// CLI 실행
if (require.main === module) {
  syncDesignTokens().catch(console.error);
}

export { syncDesignTokens };
