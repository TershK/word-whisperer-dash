import { BatchResult } from '@/types/sentiment';
import { SentimentChart } from './SentimentChart';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonViewProps {
  source1: BatchResult;
  source2: BatchResult;
}

export function ComparisonView({ source1, source2 }: ComparisonViewProps) {
  const calculateChange = (v1: number, v2: number, total1: number, total2: number) => {
    const rate1 = (v1 / total1) * 100;
    const rate2 = (v2 / total2) * 100;
    return rate2 - rate1;
  };

  const total1 = source1.results.length;
  const total2 = source2.results.length;

  const positiveChange = calculateChange(
    source1.summary.positive,
    source2.summary.positive,
    total1,
    total2
  );

  const negativeChange = calculateChange(
    source1.summary.negative,
    source2.summary.negative,
    total1,
    total2
  );

  const getTrendIcon = (change: number) => {
    if (change > 1) return <TrendingUp className="w-4 h-4 text-sentiment-positive" />;
    if (change < -1) return <TrendingDown className="w-4 h-4 text-sentiment-negative" />;
    return <Minus className="w-4 h-4 text-sentiment-neutral" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Comparative Analysis</h2>
        <p className="text-muted-foreground">
          Comparing sentiment distribution between two data sources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground text-center mb-4">
            {source1.name}
          </h3>
          <SentimentChart data={source1} />
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <ArrowRight className="w-8 h-8 text-muted-foreground hidden lg:block" />
          <div className="card-dashboard p-4 w-full">
            <h4 className="text-sm font-medium text-muted-foreground text-center mb-4">
              Key Changes
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Positive</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(positiveChange)}
                  <span
                    className={`text-sm font-medium ${
                      positiveChange > 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
                    }`}
                  >
                    {positiveChange > 0 ? '+' : ''}
                    {positiveChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Negative</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(-negativeChange)}
                  <span
                    className={`text-sm font-medium ${
                      negativeChange < 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
                    }`}
                  >
                    {negativeChange > 0 ? '+' : ''}
                    {negativeChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Sample Size</span>
                <span className="text-sm text-muted-foreground">
                  {total1} → {total2}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground text-center mb-4">
            {source2.name}
          </h3>
          <SentimentChart data={source2} />
        </div>
      </div>
    </div>
  );
}
