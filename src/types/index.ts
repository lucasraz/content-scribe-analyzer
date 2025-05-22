
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  usageCount: number;
  usageLimit: number;
}

export interface AnalysisResult {
  id: string;
  text: string;
  flagged: boolean;
  categories: string[];
  insights: string[];
  timestamp: string;
  suggestions?: string[]; // New field for text improvement suggestions
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserUsage: (count: number) => void;
}

export interface ContentContextType {
  analyses: AnalysisResult[];
  isAnalyzing: boolean;
  error: string | null;
  analyzeContent: (text: string) => Promise<AnalysisResult | null>;
  selectedAnalysis: AnalysisResult | null;
  selectAnalysis: (analysis: AnalysisResult | null) => void;
  retryCount: number;
  generateReport: (analysis: AnalysisResult | null) => string; // New function to generate reports
}
