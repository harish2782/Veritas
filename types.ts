
export interface BehavioralMetric {
  timestamp: number;
  emotion: string;
  confidenceScore: number;
  stressLevel: number;
  truthProbability: number;
  microExpressions: string[];
  voiceJitter: number;
  blinkRate: number;
}

export interface QuestionSession {
  id: string;
  question: string;
  response: string;
  analysis: BehavioralMetric;
  riskFlags: string[];
}

export interface InterviewSummary {
  candidateName: string;
  meetingUrl?: string;
  overallTruthLikelihood: number;
  averageStress: number;
  keyStrengths: string[];
  areasOfConcern: string[];
  sessions: QuestionSession[];
}

export enum AppState {
  LANDING,
  JOINING,
  INTERVIEW,
  REPORT
}
