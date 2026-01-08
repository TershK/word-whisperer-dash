import { useState, useEffect } from 'react';
import { AccuracyMetrics, SentimentType } from '@/types/sentiment';
import { analyzeSentiment, calculateAccuracyMetrics, sampleTexts } from '@/lib/sentimentAnalyzer';
import { AlertCircle, CheckCircle, BarChart3, FileText, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function AccuracyReport() {
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictions, setPredictions] = useState<{ text: string; predicted: SentimentType; actual: SentimentType }[]>([]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setPredictions([]);

    const predicted: SentimentType[] = [];
    const actual: SentimentType[] = [];
    const results: { text: string; predicted: SentimentType; actual: SentimentType }[] = [];

    for (let i = 0; i < sampleTexts.length; i++) {
      const sample = sampleTexts[i];
      const result = analyzeSentiment(sample.text);
      
      predicted.push(result.sentiment);
      actual.push(sample.actualSentiment);
      results.push({
        text: sample.text,
        predicted: result.sentiment,
        actual: sample.actualSentiment,
      });

      setProgress(((i + 1) / sampleTexts.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setPredictions(results);
    const calculatedMetrics = calculateAccuracyMetrics(predicted, actual);
    setMetrics(calculatedMetrics);
    setIsAnalyzing(false);
  };

  const sentimentLabels: SentimentType[] = ['positive', 'negative', 'neutral'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-dashboard p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Accuracy Report</h2>
            <p className="text-sm text-muted-foreground">
              Analyzing {sampleTexts.length} sample texts to evaluate classification accuracy
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            <Play className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing texts... {Math.round(progress)}%
            </p>
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat-card text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-sentiment-positive" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {(metrics.accuracy * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              </div>
              {sentimentLabels.map((label) => (
                <div key={label} className="stat-card text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(metrics.f1Score[label] * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">F1 Score</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-dashboard p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Confusion Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-muted-foreground"></th>
                        <th className="p-2 text-center text-muted-foreground" colSpan={3}>
                          Predicted
                        </th>
                      </tr>
                      <tr>
                        <th className="p-2 text-left text-muted-foreground">Actual</th>
                        {sentimentLabels.map((label) => (
                          <th key={label} className="p-2 text-center font-medium capitalize">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sentimentLabels.map((actualLabel, i) => (
                        <tr key={actualLabel}>
                          <td className="p-2 font-medium capitalize">{actualLabel}</td>
                          {sentimentLabels.map((predictedLabel, j) => (
                            <td
                              key={`${i}-${j}`}
                              className={`p-2 text-center font-mono ${
                                i === j
                                  ? 'bg-sentiment-positive-light text-sentiment-positive font-bold'
                                  : metrics.confusionMatrix[i][j] > 0
                                  ? 'bg-sentiment-negative-light text-sentiment-negative'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {metrics.confusionMatrix[i][j]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card-dashboard p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Precision & Recall
                </h3>
                <div className="space-y-4">
                  {sentimentLabels.map((label) => (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          P: {(metrics.precision[label] * 100).toFixed(0)}% | R: {(metrics.recall[label] * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500 rounded-full"
                              style={{ width: `${metrics.precision[label] * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-chart-4 transition-all duration-500 rounded-full"
                              style={{ width: `${metrics.recall[label] * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {predictions.length > 0 && (
        <div className="card-dashboard p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sample Analysis Results
          </h3>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-muted-foreground">Text</th>
                  <th className="p-3 text-center text-muted-foreground">Predicted</th>
                  <th className="p-3 text-center text-muted-foreground">Actual</th>
                  <th className="p-3 text-center text-muted-foreground">Match</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="p-3 text-foreground max-w-[300px] truncate">
                      {pred.text}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`sentiment-badge-${pred.predicted}`}>
                        {pred.predicted}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`sentiment-badge-${pred.actual}`}>
                        {pred.actual}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {pred.predicted === pred.actual ? (
                        <CheckCircle className="w-5 h-5 text-sentiment-positive inline" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-sentiment-negative inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card-dashboard p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-sentiment-neutral" />
          API Limitations Discussion
        </h3>
        <div className="prose prose-sm text-muted-foreground max-w-none">
          <p className="mb-4">
            This sentiment analysis system employs a lexicon-based approach with rule-based enhancements. 
            While effective for straightforward text, several limitations should be considered:
          </p>
          
          <h4 className="text-foreground font-medium mb-2">Context Understanding Limitations</h4>
          <p className="mb-4">
            The system processes text at a surface level, lacking deep semantic understanding. 
            Sarcasm, irony, and contextual nuances often lead to misclassification. For example, 
            "Great, another delay" would be incorrectly classified as positive due to the word "great."
            Similarly, domain-specific language or cultural expressions may not be properly interpreted.
          </p>
          
          <h4 className="text-foreground font-medium mb-2">Vocabulary Coverage</h4>
          <p className="mb-4">
            The sentiment lexicon contains a limited set of words. Emerging slang, industry jargon, 
            and non-English expressions are not recognized. This results in neutral classifications 
            for texts with unfamiliar vocabulary, even when strong sentiment exists. The system also 
            struggles with compound expressions and multi-word sentiment phrases.
          </p>
          
          <h4 className="text-foreground font-medium mb-2">Negation Handling</h4>
          <p className="mb-4">
            While basic negation ("not good") is handled, complex negation patterns ("I wouldn't say 
            it wasn't useful") can confuse the analyzer. Double negatives and scope-limited negation 
            often produce incorrect results. The system uses a simple window-based approach that may 
            miss distant modifiers.
          </p>
          
          <h4 className="text-foreground font-medium mb-2">Recommendations for Improvement</h4>
          <p>
            For production use cases requiring higher accuracy, consider integrating machine learning 
            models such as transformer-based architectures (BERT, RoBERTa) trained on domain-specific 
            data. Additionally, implementing aspect-based sentiment analysis would provide more 
            granular insights. Regular updates to the lexicon based on user feedback and emerging 
            language patterns would also improve classification accuracy over time.
          </p>
        </div>
      </div>
    </div>
  );
}
