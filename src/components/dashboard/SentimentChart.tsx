import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BatchResult } from '@/types/sentiment';

interface SentimentChartProps {
  data: BatchResult;
  chartType?: 'pie' | 'bar';
}

const COLORS = {
  positive: 'hsl(152, 76%, 40%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(38, 92%, 50%)',
};

export function SentimentChart({ data, chartType = 'pie' }: SentimentChartProps) {
  const chartData = [
    { name: 'Positive', value: data.summary.positive, color: COLORS.positive },
    { name: 'Negative', value: data.summary.negative, color: COLORS.negative },
    { name: 'Neutral', value: data.summary.neutral, color: COLORS.neutral },
  ];

  const total = data.summary.positive + data.summary.negative + data.summary.neutral;

  if (chartType === 'bar') {
    return (
      <div className="card-dashboard p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="card-dashboard p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
