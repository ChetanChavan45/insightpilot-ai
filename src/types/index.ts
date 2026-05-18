export interface LeadDetails {
  fullName: string;
  email: string;
  companyName: string;
  website: string;
  industry?: string;
  message?: string;
}

export interface EnrichedCompanyData {
  companyName: string;
  website: string;
  industry: string;
  title: string;
  description: string;
  h1s: string[];
  services: string[];
  techStackHints: string[];
  seoScore: number;
  seoObservations: string[];
  uxObservations: string[];
  aiAutomationOpportunities: string[];
  growthSuggestions: string[];
  scrapingStatus: "SUCCESS" | "FAILED" | "PARTIAL";
}

export interface AuditReportData {
  executiveSummary: string;
  companyOverview: string;
  businessAnalysis: string;
  websiteAnalysis: string;
  uxObservations: string;
  seoObservations: string;
  aiOpportunities: string;
  growthSuggestions: string;
  strategicSuggestions: string;
}

export interface WorkflowStepLog {
  step: "LEAD_CAPTURE" | "RESEARCH" | "AI_GEN" | "PDF_GEN" | "EMAIL" | "SHEETS" | "DRIVE";
  status: "SUCCESS" | "FAILED" | "RUNNING";
  message: string;
  error?: string;
}
