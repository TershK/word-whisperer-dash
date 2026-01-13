import { useState } from 'react';
import { BatchResult, SentimentType } from '@/types/sentiment';
import { SentimentChart } from './SentimentChart';
import { TextToSpeech } from './TextToSpeech';
import { Download, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Minus, BarChart2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/exportUtils';

interface BatchResultsProps {
  batch: BatchResult;
}

export function BatchResults({ batch }: BatchResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getSentimentIcon = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 text-sentiment-positive" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 text-sentiment-negative" />;
      default:
        return <Minus className="w-4 h-4 text-sentiment-neutral" />;
    }
  };

  const getSentimentBadgeClass = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return 'sentiment-badge-positive';
      case 'negative':
        return 'sentiment-badge-negative';
      default:
        return 'sentiment-badge-neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{batch.name}</h2>
          <p className="text-sm text-muted-foreground">
            {batch.results.length} texts analyzed • Average confidence: {(batch.summary.averageConfidence * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartType(chartType === 'pie' ? 'bar' : 'pie')}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            {chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(batch)}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToJSON(batch)}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF(batch)}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart data={batch} chartType={chartType} />

        <div className="card-dashboard p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Total Texts</p>
              <p className="text-3xl font-bold text-foreground">{batch.results.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Avg. Confidence</p>
              <p className="text-3xl font-bold text-primary">
                {(batch.summary.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Positive Rate</p>
              <p className="text-3xl font-bold text-sentiment-positive">
                {((batch.summary.positive / batch.results.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Negative Rate</p>
              <p className="text-3xl font-bold text-sentiment-negative">
                {((batch.summary.negative / batch.results.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-dashboard">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Individual Results</h3>
        </div>
        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          {batch.results.map((result) => (
            <div key={result.id} className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(result.id)}
              >
                <div className="flex items-center gap-3">
                  {getSentimentIcon(result.sentiment)}
                  <p className="text-foreground truncate max-w-[300px] lg:max-w-[500px]">
                    {result.text}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getSentimentBadgeClass(result.sentiment)}>
                    {result.sentiment}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                  {expandedItems.has(result.id) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {expandedItems.has(result.id) && (
                <div className="mt-4 pl-7 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Full Text:</p>
                    <TextToSpeech text={result.text} stripPunctuation />
                  </div>
                  <p className="text-foreground bg-muted/50 p-3 rounded-lg text-sm mb-3">
                    {result.text}
                  </p>
                  {result.keywords.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              kw.sentiment === 'positive'
                                ? 'bg-sentiment-positive-light text-sentiment-positive'
                                : kw.sentiment === 'negative'
                                ? 'bg-sentiment-negative-light text-sentiment-negative'
                                : 'bg-sentiment-neutral-light text-sentiment-neutral'
                            }`}
                          >
                            {kw.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
