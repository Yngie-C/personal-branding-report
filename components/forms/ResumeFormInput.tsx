"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Briefcase, Code, Folder } from "lucide-react";
import { ResumeFormInput as ResumeFormData } from "@/types/resume-form";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onError: (message: string) => void;
  initialData?: ResumeFormData; // 파일 업로드 시 자동 완성 데이터
}

export default function ResumeFormInput({ sessionId, onComplete, onError, initialData }: Props) {
  const [formData, setFormData] = useState<ResumeFormData>(
    initialData || {
      personalInfo: { name: '' },
      experiences: [
        { company: '', role: '', startDate: '', endDate: '', achievements: [''] }
      ],
      skills: [''],
      projects: [
        { name: '', description: '', impact: '', technologies: [] }
      ],
    }
  );
  const [loading, setLoading] = useState(false);

  // initialData가 변경되면 formData 업데이트 (파일 업로드 후 자동 완성)
  useEffect(() => {
    if (initialData) {
      console.log('[ResumeFormInput] Updating form data from initialData:', initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/resume-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이력서 저장에 실패했습니다.');
      }

      onComplete();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 경력 추가/삭제
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: '', role: '', startDate: '', endDate: '', achievements: [''] }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // 성과 추가/삭제
  const addAchievement = (expIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIndex
          ? { ...exp, achievements: [...exp.achievements, ''] }
          : exp
      )
    }));
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIndex
          ? { ...exp, achievements: exp.achievements.filter((_, j) => j !== achIndex) }
          : exp
      )
    }));
  };

  // 스킬 추가/삭제
  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // 프로젝트 추가/삭제
  const addProject = () => {
    if (formData.projects.length >= 3) {
      onError('대표 프로젝트는 최대 3개까지 입력 가능합니다.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', impact: '', technologies: [] }
      ]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      {/* 개인정보 (선택) */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          이름 (선택)
        </label>
        <Input
          type="text"
          placeholder="브랜딩 보고서에 표시할 이름"
          value={formData.personalInfo.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personalInfo: { name: e.target.value }
          }))}
        />
        <p className="text-xs text-gray-500 mt-1">
          비워두면 &quot;사용자&quot;로 표시됩니다
        </p>
      </div>

      {/* 경력사항 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">경력사항 (선택)</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            <Plus className="w-4 h-4 mr-1" /> 경력 추가
          </Button>
        </div>

        {formData.experiences.map((exp, expIdx) => (
          <div key={expIdx} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">경력 {expIdx + 1}</span>
              {formData.experiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(expIdx)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <Input
                placeholder="회사명 *"
                value={exp.company}
                onChange={(e) => {
                  const newExps = [...formData.experiences];
                  newExps[expIdx].company = e.target.value;
                  setFormData(prev => ({ ...prev, experiences: newExps }));
                }}
              />
              <Input
                placeholder="직책 *"
                value={exp.role}
                onChange={(e) => {
                  const newExps = [...formData.experiences];
                  newExps[expIdx].role = e.target.value;
                  setFormData(prev => ({ ...prev, experiences: newExps }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <Input
                type="month"
                placeholder="시작일 *"
                value={exp.startDate}
                onChange={(e) => {
                  const newExps = [...formData.experiences];
                  newExps[expIdx].startDate = e.target.value;
                  setFormData(prev => ({ ...prev, experiences: newExps }));
                }}
              />
              <div className="flex gap-2">
                <Input
                  type="month"
                  placeholder="종료일"
                  value={exp.endDate === 'current' ? '' : exp.endDate}
                  onChange={(e) => {
                    const newExps = [...formData.experiences];
                    newExps[expIdx].endDate = e.target.value;
                    setFormData(prev => ({ ...prev, experiences: newExps }));
                  }}
                  disabled={exp.endDate === 'current'}
                />
                <Button
                  type="button"
                  variant={exp.endDate === 'current' ? 'default' : 'outline'}
                  onClick={() => {
                    const newExps = [...formData.experiences];
                    newExps[expIdx].endDate = exp.endDate === 'current' ? '' : 'current';
                    setFormData(prev => ({ ...prev, experiences: newExps }));
                  }}
                >
                  재직중
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">주요 성과 *</label>
              {exp.achievements.map((achievement, achIdx) => (
                <div key={achIdx} className="flex gap-2 mb-2">
                  <Textarea
                    placeholder={`성과 ${achIdx + 1} (구체적인 수치나 임팩트 포함)`}
                    value={achievement}
                    rows={2}
                    onChange={(e) => {
                      const newExps = [...formData.experiences];
                      newExps[expIdx].achievements[achIdx] = e.target.value;
                      setFormData(prev => ({ ...prev, experiences: newExps }));
                    }}
                    className="flex-1"
                  />
                  {exp.achievements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAchievement(expIdx, achIdx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAchievement(expIdx)}
              >
                <Plus className="w-4 h-4 mr-1" /> 성과 추가
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 핵심 역량/기술 스택 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Code className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">핵심 역량/기술 스택 (선택)</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="w-4 h-4 mr-1" /> 스킬 추가
          </Button>
        </div>

        {formData.skills.map((skill, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input
              placeholder={`기술 ${idx + 1} (예: React, Project Management, UX Design)`}
              value={skill}
              onChange={(e) => {
                const newSkills = [...formData.skills];
                newSkills[idx] = e.target.value;
                setFormData(prev => ({ ...prev, skills: newSkills }));
              }}
              className="flex-1"
            />
            {formData.skills.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* 대표 프로젝트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Folder className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">대표 프로젝트 (선택, 최대 3개)</h3>
          </div>
          {formData.projects.length < 3 && (
            <Button type="button" variant="outline" size="sm" onClick={addProject}>
              <Plus className="w-4 h-4 mr-1" /> 프로젝트 추가
            </Button>
          )}
        </div>

        {formData.projects.map((proj, projIdx) => (
          <div key={projIdx} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">프로젝트 {projIdx + 1}</span>
              {formData.projects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(projIdx)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <Input
                placeholder="프로젝트명 *"
                value={proj.name}
                onChange={(e) => {
                  const newProjs = [...formData.projects];
                  newProjs[projIdx].name = e.target.value;
                  setFormData(prev => ({ ...prev, projects: newProjs }));
                }}
              />
              <Textarea
                placeholder="프로젝트 설명 * (무엇을 만들었는지, 어떤 문제를 해결했는지)"
                value={proj.description}
                rows={3}
                onChange={(e) => {
                  const newProjs = [...formData.projects];
                  newProjs[projIdx].description = e.target.value;
                  setFormData(prev => ({ ...prev, projects: newProjs }));
                }}
              />
              <Textarea
                placeholder="성과/임팩트 * (정량적 지표나 결과)"
                value={proj.impact}
                rows={2}
                onChange={(e) => {
                  const newProjs = [...formData.projects];
                  newProjs[projIdx].impact = e.target.value;
                  setFormData(prev => ({ ...prev, projects: newProjs }));
                }}
              />
              <Input
                placeholder="사용 기술 (선택, 쉼표로 구분)"
                value={proj.technologies?.join(', ') || ''}
                onChange={(e) => {
                  const newProjs = [...formData.projects];
                  newProjs[projIdx].technologies = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, projects: newProjs }));
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading ? "저장 중..." : "이력서 정보 저장"}
      </Button>
    </div>
  );
}
