export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  summary: string;
  experiences: {
    company: string;
    role: string;
    duration: string;
    achievements: string[];
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  skills: string[];
  certifications: string[];
}
