import { ParsedResume } from './resume';

/**
 * 폼으로 입력받을 이력서 데이터 (최소화)
 *
 * 개인정보는 이름만 선택적으로 수집
 * 학력, 자격증, 수상경력은 제외
 */
export interface ResumeFormInput {
  // 개인정보 (최소화)
  personalInfo: {
    name?: string; // 선택: 브랜딩 보고서에 표시, 비워두면 "사용자"로 대체
  };

  // 경력사항 (필수, 최소 1개)
  experiences: {
    company: string;           // 회사명
    role: string;              // 직책
    startDate: string;         // 시작일 (YYYY-MM 형식)
    endDate: string | 'current'; // 종료일 (YYYY-MM 형식) 또는 'current'
    achievements: string[];    // 주요 성과 (최소 1개)
  }[];

  // 핵심역량/기술 스택 (필수, 최소 1개)
  skills: string[];

  // 대표 프로젝트 (필수, 1-3개)
  projects: {
    name: string;              // 프로젝트명
    description: string;       // 프로젝트 설명
    impact: string;            // 성과/임팩트
    technologies?: string[];   // 사용 기술 (선택)
  }[];
}

/**
 * ResumeFormInput을 ParsedResume 형식으로 변환
 *
 * @param formInput - 폼으로 입력받은 데이터
 * @returns ParsedResume - 에이전트가 사용하는 표준 이력서 형식
 */
export function formInputToParsedResume(formInput: ResumeFormInput): ParsedResume {
  // 경력사항의 duration 생성
  const experiences = formInput.experiences.map(exp => ({
    company: exp.company,
    role: exp.role,
    duration: `${exp.startDate} - ${exp.endDate === 'current' ? '현재' : exp.endDate}`,
    achievements: exp.achievements,
  }));

  // 프로젝트 정보를 summary 형태로 변환
  const projectSummaries = formInput.projects.map(proj =>
    `[${proj.name}] ${proj.description} - 성과: ${proj.impact}${
      proj.technologies && proj.technologies.length > 0
        ? ` (기술: ${proj.technologies.join(', ')})`
        : ''
    }`
  ).join('\n\n');

  return {
    personalInfo: {
      name: formInput.personalInfo.name || '사용자',
      email: '', // 폼에서는 수집하지 않음 (세션에 있음)
      phone: undefined,
      location: undefined,
    },
    summary: `## 대표 프로젝트\n\n${projectSummaries}`, // 프로젝트를 summary에 포함
    experiences,
    education: [], // 학력 제외
    skills: formInput.skills,
    certifications: [], // 자격증 제외
  };
}

/**
 * ParsedResume를 ResumeFormInput 형식으로 변환
 *
 * @param parsed - 에이전트가 파싱한 이력서 데이터
 * @returns ResumeFormInput - 폼에 채울 수 있는 데이터
 */
export function parsedResumeToFormInput(parsed: ParsedResume): ResumeFormInput {
  /**
   * duration 문자열을 startDate와 endDate로 분리
   * 예: "2020-01 - 현재" → { startDate: "2020-01", endDate: "current" }
   *      "2020.01 ~ 2022.12" → { startDate: "2020-01", endDate: "2022-12" }
   */
  function parseDuration(duration: string): { startDate: string; endDate: string | 'current' } {
    // 다양한 구분자 정규화: -, ~, to, ., / 등
    const normalized = duration
      .replace(/\s*~\s*/g, ' - ')
      .replace(/\s+to\s+/gi, ' - ')
      .replace(/\./g, '-')
      .replace(/\//g, '-');

    // "YYYY-MM - YYYY-MM" 또는 "YYYY-MM - 현재/current/재직중" 패턴 매칭
    const match = normalized.match(/(\d{4}-\d{2})\s*-\s*(.+)/);

    if (match) {
      const startDate = match[1];
      const endPart = match[2].trim();

      // "현재", "current", "재직중", "present" 등을 'current'로 변환
      const endDate = /현재|current|재직중|present/i.test(endPart)
        ? 'current'
        : endPart.match(/\d{4}-\d{2}/)
        ? endPart.match(/\d{4}-\d{2}/)![0]
        : '';

      return { startDate, endDate };
    }

    // 파싱 실패 시 빈 값 반환
    return { startDate: '', endDate: '' };
  }

  // 경력사항 변환
  const experiences = (parsed.experiences || []).map(exp => {
    const { startDate, endDate } = parseDuration(exp.duration || '');
    return {
      company: exp.company || '',
      role: exp.role || '',
      startDate,
      endDate,
      achievements: exp.achievements && exp.achievements.length > 0
        ? exp.achievements
        : [''],
    };
  });

  // 스킬 변환
  const skills = parsed.skills && parsed.skills.length > 0
    ? parsed.skills
    : [''];

  // 프로젝트 변환 (기본적으로 빈 프로젝트 1개 생성)
  // summary에서 프로젝트를 추출하기는 어려우므로 사용자가 직접 입력하도록 유도
  const projects = [{
    name: '',
    description: '',
    impact: '',
    technologies: [],
  }];

  return {
    personalInfo: {
      name: parsed.personalInfo?.name || '',
    },
    experiences: experiences.length > 0 ? experiences : [{
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      achievements: [''],
    }],
    skills,
    projects,
  };
}

/**
 * 폼 데이터 검증 결과
 */
export interface FormValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ResumeFormInput 데이터 검증
 *
 * 변경사항: 모든 필드를 선택 사항으로 변경
 * - 이름: 선택 (비워두면 "사용자"로 표시)
 * - 경력, 스킬, 프로젝트: 모두 선택 (빈 배열 허용)
 * - 입력된 항목에 대해서만 유효성 검증
 *
 * @param formData - 검증할 폼 데이터
 * @returns FormValidationResult - 검증 결과
 */
export function validateResumeForm(formData: ResumeFormInput): FormValidationResult {
  const errors: string[] = [];

  // 경력사항 검증 (선택사항, 입력된 경우만 검증)
  if (formData.experiences && formData.experiences.length > 0) {
    formData.experiences.forEach((exp, idx) => {
      // 경력이 입력된 경우, 필수 필드 검증
      const hasAnyField = exp.company || exp.role || exp.startDate || exp.endDate ||
        (exp.achievements && exp.achievements.some(a => a && a.trim() !== ''));

      if (hasAnyField) {
        if (!exp.company || exp.company.trim() === '') {
          errors.push(`경력 ${idx + 1}: 회사명을 입력해주세요.`);
        }
        if (!exp.role || exp.role.trim() === '') {
          errors.push(`경력 ${idx + 1}: 직책을 입력해주세요.`);
        }
        if (!exp.startDate) {
          errors.push(`경력 ${idx + 1}: 시작일을 입력해주세요.`);
        }
        if (!exp.endDate) {
          errors.push(`경력 ${idx + 1}: 종료일을 입력하거나 '재직중'을 선택해주세요.`);
        }
      }
    });
  }

  // 스킬 검증 (선택사항, 빈 배열 허용)
  // 별도 검증 필요 없음

  // 프로젝트 검증 (선택사항, 입력된 경우만 검증)
  if (formData.projects && formData.projects.length > 0) {
    if (formData.projects.length > 3) {
      errors.push('대표 프로젝트는 최대 3개까지 입력 가능합니다.');
    }

    formData.projects.forEach((proj, idx) => {
      // 프로젝트가 입력된 경우, 필수 필드 검증
      const hasAnyField = proj.name || proj.description || proj.impact ||
        (proj.technologies && proj.technologies.length > 0);

      if (hasAnyField) {
        if (!proj.name || proj.name.trim() === '') {
          errors.push(`프로젝트 ${idx + 1}: 프로젝트명을 입력해주세요.`);
        }
        if (!proj.description || proj.description.trim() === '') {
          errors.push(`프로젝트 ${idx + 1}: 프로젝트 설명을 입력해주세요.`);
        }
        if (!proj.impact || proj.impact.trim() === '') {
          errors.push(`프로젝트 ${idx + 1}: 성과/임팩트를 입력해주세요.`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
