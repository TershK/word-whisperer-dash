export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  id: string;
  text: string;
  sentiment: SentimentType;
  confidence: number;
  keywords: KeywordResult[];
  explanation: string;
  timestamp: Date;
}

export interface KeywordResult {
  word: string;
  sentiment: SentimentType;
  impact: number; // -1 to 1
}

export interface BatchResult {
  id: string;
  name: string;
  results: SentimentResult[];
  summary: {
    positive: number;
    negative: number;
    neutral: number;
    averageConfidence: number;
  };
  createdAt: Date;
}

export interface ComparisonData {
  source1: BatchResult;
  source2: BatchResult;
}

export interface AccuracyMetrics {
  accuracy: number;
  precision: {
    positive: number;
    negative: number;
    neutral: number;
  };
  recall: {
    positive: number;
    negative: number;
    neutral: number;
  };
  f1Score: {
    positive: number;
    negative: number;
    neutral: number;
  };
  confusionMatrix: number[][];
}
