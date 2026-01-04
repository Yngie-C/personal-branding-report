import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { ParsedResume } from '@/types/resume';
import { formInputToParsedResume, ResumeFormInput } from '@/types/resume-form';

export interface ResumeParserInput {
  fileUrl: string;
  fileContent?: string; // PDF/DOCX를 텍스트로 변환한 내용
  source?: 'file' | 'form'; // 데이터 소스
  formData?: ResumeFormInput; // 폼 입력 데이터 (source='form'일 때)
}

export class ResumeParserAgent extends BaseAgent<ResumeParserInput, ParsedResume> {
  constructor() {
    super(
      'ResumeParserAgent',
      `이력서 파서. 텍스트 → 구조화 JSON:

{
  "personalInfo": {"name": "이름", "email": "이메일", "phone": "전화", "location": "위치"},
  "summary": "자기소개",
  "experiences": [{"company": "회사", "role": "직책", "duration": "기간", "description": "업무설명", "achievements": ["성과1"]}],
  "education": [{"school": "학교", "degree": "학위", "year": "연도"}],
  "skills": ["스킬1", "스킬2"],
  "certifications": ["자격증1"]
}

누락 시 빈 배열/문자열. 유효한 JSON만 출력. 한/영 처리.`
    );
  }

  async process(
    input: ResumeParserInput,
    context: AgentContext
  ): Promise<AgentResult<ParsedResume>> {
    try {
      const { fileContent, source, formData } = input;

      // Form 입력인 경우: LLM 호출 없이 직접 변환
      if (source === 'form' && formData) {
        console.log(`[ResumeParser] Processing form input (no LLM needed)`);
        const parsed = formInputToParsedResume(formData);

        console.log(`[ResumeParser] Successfully converted form input to ParsedResume`);

        return this.success(parsed, {
          source: 'form',
          experienceCount: parsed.experiences?.length || 0,
          skillCount: parsed.skills?.length || 0,
        });
      }

      // File 업로드인 경우: 기존 LLM 파싱 로직 사용
      if (!fileContent) {
        return this.failure('이력서 내용이 제공되지 않았습니다.');
      }

      console.log(`[ResumeParser] Parsing resume from file...`);

      const userMessage = `다음 이력서 텍스트를 분석하여 JSON 형식으로 변환해주세요:

${fileContent}

JSON 출력:`;

      const response = await this.callLLM(userMessage);

      // JSON 추출 (```json ... ``` 형식이 있을 수 있음)
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed: ParsedResume = JSON.parse(jsonStr);

      // 데이터 검증
      if (!parsed.personalInfo || !parsed.personalInfo.name) {
        return this.failure('이력서에서 필수 정보(이름)를 찾을 수 없습니다.');
      }

      console.log(`[ResumeParser] Successfully parsed resume for: ${parsed.personalInfo.name}`);

      return this.success(parsed, {
        source: 'file',
        experienceCount: parsed.experiences?.length || 0,
        skillCount: parsed.skills?.length || 0,
      });
    } catch (error: any) {
      console.error(`[ResumeParser] Error:`, error);
      return this.failure(`이력서 파싱 실패: ${error.message}`);
    }
  }
}
