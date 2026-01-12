import { Star } from 'lucide-react';

interface StarRatingProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export function StarRating({ sentiment, confidence }: StarRatingProps) {
  // Calculate rating based on sentiment and confidence
  const calculateRating = (): number => {
    if (sentiment === 'positive') {
      // Positive: 3.5 to 5.0 based on confidence
      return 3.5 + (confidence * 1.5);
    } else if (sentiment === 'negative') {
      // Negative: 1.0 to 2.5 based on inverse confidence
      return 1.0 + ((1 - confidence) * 1.5);
    } else {
      // Neutral: 2.5 to 3.5 based on confidence
      return 2.5 + (confidence * 1);
    }
  };

  const rating = calculateRating();
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;

  return (
    <div className="bg-muted/50 rounded-xl p-4 mb-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Aggregate Satisfaction
      </p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {/* Background star (empty) */}
            <Star className="w-6 h-6 text-muted-foreground/30" />
            {/* Filled star overlay */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: star <= fullStars 
                  ? '100%' 
                  : star === fullStars + 1 
                    ? `${partialFill * 100}%` 
                    : '0%'
              }}
            >
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/ 5.0</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Based on sentiment analysis
      </p>
    </div>
  );
}
