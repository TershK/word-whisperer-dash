import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SentimentResult } from '@/types/sentiment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SingleSentimentChartProps {
  result: SentimentResult;
}

const COLORS = {
  positive: 'hsl(152, 76%, 40%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(38, 92%, 50%)',
};

export function SingleSentimentChart({ result }: SingleSentimentChartProps) {
  // Create data showing confidence distribution for all sentiment types
  const confidenceData = [
    { 
      name: 'Positive', 
      value: result.sentiment === 'positive' ? result.confidence * 100 : (1 - result.confidence) * 30,
      color: COLORS.positive 
    },
    { 
      name: 'Negative', 
      value: result.sentiment === 'negative' ? result.confidence * 100 : (1 - result.confidence) * 30,
      color: COLORS.negative 
    },
    { 
      name: 'Neutral', 
      value: result.sentiment === 'neutral' ? result.confidence * 100 : (1 - result.confidence) * 40,
      color: COLORS.neutral 
    },
  ];

  // Highlight the detected sentiment
  const highlightedData = confidenceData.map(item => ({
    ...item,
    value: item.name.toLowerCase() === result.sentiment 
      ? result.confidence * 100 
      : Math.max(5, (1 - result.confidence) * 50 / 2)
  }));

  // Keyword impact data for bar chart
  const keywordData = result.keywords.slice(0, 6).map(keyword => ({
    name: keyword.word,
    impact: Math.abs(keyword.impact * 100),
    color: keyword.sentiment === 'positive' 
      ? COLORS.positive 
      : keyword.sentiment === 'negative' 
      ? COLORS.negative 
      : COLORS.neutral
  }));

  return (
    <div className="card-dashboard p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Visualization</h3>
      
      <Tabs defaultValue="pie" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pie">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={highlightedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {highlightedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={entry.name.toLowerCase() === result.sentiment ? 1 : 0.4}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Confidence']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Detected: <span className="font-semibold capitalize" style={{ color: COLORS[result.sentiment] }}>
                {result.sentiment}
              </span> with {(result.confidence * 100).toFixed(1)}% confidence
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="bar">
          {keywordData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))" 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Impact']}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {keywordData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No keyword impact data available
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Keyword impact on sentiment analysis
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
