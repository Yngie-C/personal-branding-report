export interface PortfolioAnalysis {
  projects: {
    name: string;
    description: string;
    technologies: string[];
    impact: string;
  }[];
  designStyle: string;
  strengths: string[];
  uniquePoints: string[];
}
