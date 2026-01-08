import { SentimentResult, SentimentType, KeywordResult, BatchResult, AccuracyMetrics } from '@/types/sentiment';

// Sentiment word lists for keyword extraction
const positiveWords = [
  'love', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'best',
  'happy', 'joy', 'pleased', 'satisfied', 'recommend', 'perfect', 'awesome', 'brilliant',
  'outstanding', 'superb', 'delighted', 'impressive', 'exceptional', 'beautiful', 'helpful',
  'friendly', 'professional', 'quality', 'thank', 'appreciate', 'enjoy', 'favorite'
];

const negativeWords = [
  'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing', 'poor',
  'angry', 'frustrated', 'annoyed', 'upset', 'complaint', 'problem', 'issue', 'broken',
  'useless', 'waste', 'rude', 'slow', 'expensive', 'overpriced', 'never', 'refund',
  'cancel', 'avoid', 'regret', 'unfortunately', 'failed', 'error', 'mistake', 'wrong'
];

const neutralWords = [
  'okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular', 'basic',
  'adequate', 'acceptable', 'moderate', 'fair', 'reasonable', 'ordinary', 'common'
];

// Intensifiers that modify sentiment strength
const intensifiers = {
  positive: ['very', 'extremely', 'absolutely', 'really', 'totally', 'completely', 'highly'],
  negative: ['not', 'never', "don't", "doesn't", "didn't", "won't", "can't", 'barely', 'hardly']
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  const foundKeywords: KeywordResult[] = [];
  
  // Check for intensifiers before sentiment words
  let negationActive = false;
  let intensifierActive = false;
  
  words.forEach((word, index) => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    
    // Check for negation
    if (intensifiers.negative.includes(cleanWord)) {
      negationActive = true;
      return;
    }
    
    // Check for positive intensifiers
    if (intensifiers.positive.includes(cleanWord)) {
      intensifierActive = true;
      return;
    }
    
    const multiplier = intensifierActive ? 1.5 : 1;
    
    if (positiveWords.includes(cleanWord)) {
      if (negationActive) {
        negativeScore += 1 * multiplier;
        foundKeywords.push({ word: cleanWord, sentiment: 'negative', impact: -0.5 * multiplier });
      } else {
        positiveScore += 1 * multiplier;
        foundKeywords.push({ word: cleanWord, sentiment: 'positive', impact: 0.5 * multiplier });
      }
    } else if (negativeWords.includes(cleanWord)) {
      if (negationActive) {
        positiveScore += 0.5 * multiplier;
        foundKeywords.push({ word: cleanWord, sentiment: 'positive', impact: 0.3 * multiplier });
      } else {
        negativeScore += 1 * multiplier;
        foundKeywords.push({ word: cleanWord, sentiment: 'negative', impact: -0.5 * multiplier });
      }
    } else if (neutralWords.includes(cleanWord)) {
      neutralScore += 1;
      foundKeywords.push({ word: cleanWord, sentiment: 'neutral', impact: 0 });
    }
    
    // Reset modifiers after using them
    negationActive = false;
    intensifierActive = false;
  });
  
  // Calculate total and determine sentiment
  const total = positiveScore + negativeScore + neutralScore;
  
  let sentiment: SentimentType;
  let confidence: number;
  let explanation: string;
  
  if (total === 0) {
    sentiment = 'neutral';
    confidence = 0.5;
    explanation = 'No strong sentiment indicators were found in the text.';
  } else {
    const positiveRatio = positiveScore / total;
    const negativeRatio = negativeScore / total;
    const neutralRatio = neutralScore / total;
    
    if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
      sentiment = 'positive';
      confidence = Math.min(0.95, 0.5 + positiveRatio * 0.5);
      const topKeywords = foundKeywords.filter(k => k.sentiment === 'positive').slice(0, 3).map(k => k.word);
      explanation = `This text expresses positive sentiment. Key indicators include: ${topKeywords.join(', ') || 'general positive tone'}. The language suggests satisfaction, approval, or enthusiasm.`;
    } else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
      sentiment = 'negative';
      confidence = Math.min(0.95, 0.5 + negativeRatio * 0.5);
      const topKeywords = foundKeywords.filter(k => k.sentiment === 'negative').slice(0, 3).map(k => k.word);
      explanation = `This text expresses negative sentiment. Key indicators include: ${topKeywords.join(', ') || 'general negative tone'}. The language suggests dissatisfaction, criticism, or frustration.`;
    } else {
      sentiment = 'neutral';
      confidence = Math.min(0.9, 0.5 + neutralRatio * 0.4);
      explanation = 'This text is relatively neutral or balanced. It may contain mixed sentiments or lack strong emotional indicators.';
    }
  }
  
  // Limit keywords to top 5 by impact
  const topKeywords = foundKeywords
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);
  
  return {
    id: generateId(),
    text,
    sentiment,
    confidence,
    keywords: topKeywords,
    explanation,
    timestamp: new Date()
  };
}

export function analyzeBatch(texts: string[], batchName: string): BatchResult {
  const results = texts.map(text => analyzeSentiment(text));
  
  const summary = {
    positive: results.filter(r => r.sentiment === 'positive').length,
    negative: results.filter(r => r.sentiment === 'negative').length,
    neutral: results.filter(r => r.sentiment === 'neutral').length,
    averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  };
  
  return {
    id: generateId(),
    name: batchName,
    results,
    summary,
    createdAt: new Date()
  };
}

export function calculateAccuracyMetrics(
  predicted: SentimentType[],
  actual: SentimentType[]
): AccuracyMetrics {
  const classes: SentimentType[] = ['positive', 'negative', 'neutral'];
  
  // Initialize confusion matrix (3x3 for 3 classes)
  const confusionMatrix: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  
  // Fill confusion matrix
  predicted.forEach((pred, i) => {
    const actualVal = actual[i];
    const predIndex = classes.indexOf(pred);
    const actualIndex = classes.indexOf(actualVal);
    confusionMatrix[actualIndex][predIndex]++;
  });
  
  // Calculate metrics for each class
  const precision: Record<SentimentType, number> = { positive: 0, negative: 0, neutral: 0 };
  const recall: Record<SentimentType, number> = { positive: 0, negative: 0, neutral: 0 };
  const f1Score: Record<SentimentType, number> = { positive: 0, negative: 0, neutral: 0 };
  
  classes.forEach((cls, i) => {
    const tp = confusionMatrix[i][i];
    const fp = confusionMatrix.reduce((sum, row, j) => j !== i ? sum + row[i] : sum, 0);
    const fn = confusionMatrix[i].reduce((sum, val, j) => j !== i ? sum + val : sum, 0);
    
    precision[cls] = tp + fp > 0 ? tp / (tp + fp) : 0;
    recall[cls] = tp + fn > 0 ? tp / (tp + fn) : 0;
    f1Score[cls] = precision[cls] + recall[cls] > 0 
      ? 2 * (precision[cls] * recall[cls]) / (precision[cls] + recall[cls]) 
      : 0;
  });
  
  // Calculate overall accuracy
  const correctPredictions = confusionMatrix.reduce((sum, row, i) => sum + row[i], 0);
  const totalPredictions = predicted.length;
  const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
  
  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix
  };
}

// Sample dataset for accuracy testing
export const sampleTexts: { text: string; actualSentiment: SentimentType }[] = [
  { text: "I absolutely love this product! Best purchase ever.", actualSentiment: "positive" },
  { text: "Terrible experience. Would never recommend to anyone.", actualSentiment: "negative" },
  { text: "The product is okay, nothing special.", actualSentiment: "neutral" },
  { text: "Amazing customer service! They went above and beyond.", actualSentiment: "positive" },
  { text: "Waste of money. Completely disappointed.", actualSentiment: "negative" },
  { text: "It works as expected. Standard quality.", actualSentiment: "neutral" },
  { text: "This exceeded all my expectations! Fantastic!", actualSentiment: "positive" },
  { text: "Horrible quality. Broke after one day.", actualSentiment: "negative" },
  { text: "Average product at an average price.", actualSentiment: "neutral" },
  { text: "I'm so happy with this purchase. Highly recommend!", actualSentiment: "positive" },
  { text: "Don't buy this. Total scam.", actualSentiment: "negative" },
  { text: "It's fine for what it is.", actualSentiment: "neutral" },
  { text: "Excellent quality and fast shipping!", actualSentiment: "positive" },
  { text: "Arrived damaged and customer service was rude.", actualSentiment: "negative" },
  { text: "Does the job. Nothing more, nothing less.", actualSentiment: "neutral" },
  { text: "Best decision I ever made. Love it!", actualSentiment: "positive" },
  { text: "Completely useless. Want my money back.", actualSentiment: "negative" },
  { text: "Acceptable quality for the price.", actualSentiment: "neutral" },
  { text: "Outstanding product! Will buy again.", actualSentiment: "positive" },
  { text: "Very disappointing experience overall.", actualSentiment: "negative" },
  { text: "Meets basic requirements.", actualSentiment: "neutral" },
  { text: "I'm extremely satisfied with everything!", actualSentiment: "positive" },
  { text: "Worst purchase ever. Avoid at all costs.", actualSentiment: "negative" },
  { text: "Standard product, standard experience.", actualSentiment: "neutral" },
  { text: "Perfect in every way. Couldn't be happier!", actualSentiment: "positive" },
  { text: "Failed to work properly. Very frustrated.", actualSentiment: "negative" },
  { text: "It's adequate for everyday use.", actualSentiment: "neutral" },
  { text: "Wonderful experience from start to finish!", actualSentiment: "positive" },
  { text: "Terrible quality and overpriced.", actualSentiment: "negative" },
  { text: "Fair value for money.", actualSentiment: "neutral" },
  { text: "This made my day! Absolutely brilliant!", actualSentiment: "positive" },
  { text: "Complete waste of time and money.", actualSentiment: "negative" },
  { text: "Regular product, works normally.", actualSentiment: "neutral" },
  { text: "Exceptional service and quality!", actualSentiment: "positive" },
  { text: "Never buying from here again. Awful.", actualSentiment: "negative" },
  { text: "It's okay, does what it says.", actualSentiment: "neutral" },
  { text: "I recommend this to everyone!", actualSentiment: "positive" },
  { text: "Extremely poor quality. Very angry.", actualSentiment: "negative" },
  { text: "Moderate quality at a moderate price.", actualSentiment: "neutral" },
  { text: "Delighted with my purchase! Thank you!", actualSentiment: "positive" },
  { text: "This is a disaster. Avoid.", actualSentiment: "negative" },
  { text: "Basic functionality works fine.", actualSentiment: "neutral" },
  { text: "Amazing! Beyond my expectations!", actualSentiment: "positive" },
  { text: "Regret buying this. Very unhappy.", actualSentiment: "negative" },
  { text: "Standard quality for the category.", actualSentiment: "neutral" },
  { text: "Superb quality and great value!", actualSentiment: "positive" },
  { text: "Broken on arrival. Terrible.", actualSentiment: "negative" },
  { text: "Normal everyday product.", actualSentiment: "neutral" },
  { text: "I'm impressed! Great job!", actualSentiment: "positive" },
  { text: "Cheap and useless. Don't bother.", actualSentiment: "negative" },
];
