import { SentimentResult as SentimentResultType } from '@/types/sentiment';
import { ThumbsUp, ThumbsDown, Minus, Tag, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StarRating } from './StarRating';
import { TextToSpeech } from './TextToSpeech';

interface SentimentResultProps {
  result: SentimentResultType;
}

export function SentimentResultCard({ result }: SentimentResultProps) {
  const getMoodDetails = (sentiment: string, confidence: number) => {
    if (sentiment === 'positive') {
      if (confidence >= 0.8) return { emoji: '😄', mood: 'Ecstatic' };
      if (confidence >= 0.6) return { emoji: '😊', mood: 'Happy' };
      return { emoji: '🙂', mood: 'Content' };
    } else if (sentiment === 'negative') {
      if (confidence >= 0.8) return { emoji: '😠', mood: 'Angry' };
      if (confidence >= 0.6) return { emoji: '😔', mood: 'Sad' };
      return { emoji: '😕', mood: 'Disappointed' };
    } else {
      if (confidence >= 0.7) return { emoji: '😐', mood: 'Indifferent' };
      return { emoji: '🤔', mood: 'Contemplative' };
    }
  };

  const sentimentConfig = {
    positive: {
      icon: ThumbsUp,
      label: 'Positive',
      badgeClass: 'sentiment-badge-positive',
      bgClass: 'bg-sentiment-positive-light',
      textClass: 'text-sentiment-positive',
      progressColor: 'bg-sentiment-positive',
    },
    negative: {
      icon: ThumbsDown,
      label: 'Negative',
      badgeClass: 'sentiment-badge-negative',
      bgClass: 'bg-sentiment-negative-light',
      textClass: 'text-sentiment-negative',
      progressColor: 'bg-sentiment-negative',
    },
    neutral: {
      icon: Minus,
      label: 'Neutral',
      badgeClass: 'sentiment-badge-neutral',
      bgClass: 'bg-sentiment-neutral-light',
      textClass: 'text-sentiment-neutral',
      progressColor: 'bg-sentiment-neutral',
    },
  };

  const moodDetails = getMoodDetails(result.sentiment, result.confidence);

  const config = sentimentConfig[result.sentiment];
  const Icon = config.icon;

  return (
    <div className="card-dashboard p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgClass} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.textClass}`} />
          </div>
          <div>
            <span className={config.badgeClass}>{config.label}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className={`text-2xl font-bold ${config.textClass}`}>
            {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Mood Indicator */}
      <div className={`mb-4 p-4 rounded-xl ${config.bgClass} border border-${config.textClass}/20`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{moodDetails.emoji}</span>
          <div>
            <p className="text-sm text-muted-foreground">Detected Mood</p>
            <p className={`text-xl font-bold ${config.textClass}`}>{moodDetails.mood}</p>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <StarRating sentiment={result.sentiment} confidence={result.confidence} />

      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} transition-all duration-500 rounded-full`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Analyzed Text</p>
          <TextToSpeech text={result.text} />
        </div>
        <p className="text-foreground bg-muted/50 p-3 rounded-lg text-sm leading-relaxed">
          "{result.text.length > 200 ? result.text.slice(0, 200) + '...' : result.text}"
        </p>
      </div>

      {result.keywords.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Key Sentiment Drivers</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((keyword, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  keyword.sentiment === 'positive'
                    ? 'bg-sentiment-positive-light text-sentiment-positive'
                    : keyword.sentiment === 'negative'
                    ? 'bg-sentiment-negative-light text-sentiment-negative'
                    : 'bg-sentiment-neutral-light text-sentiment-neutral'
                }`}
              >
                {keyword.word}
                <span className="ml-1 opacity-70">
                  ({keyword.impact > 0 ? '+' : ''}{(keyword.impact * 100).toFixed(0)}%)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Explanation</p>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
