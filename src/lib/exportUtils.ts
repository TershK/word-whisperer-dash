import { BatchResult } from '@/types/sentiment';

export function exportToCSV(batch: BatchResult): void {
  const headers = ['Text', 'Sentiment', 'Confidence', 'Keywords', 'Explanation'];
  const rows = batch.results.map(result => [
    `"${result.text.replace(/"/g, '""')}"`,
    result.sentiment,
    (result.confidence * 100).toFixed(2),
    `"${result.keywords.map(k => k.word).join(', ')}"`,
    `"${result.explanation.replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, `${batch.name}-sentiment-analysis.csv`, 'text/csv');
}

export function exportToJSON(batch: BatchResult): void {
  const exportData = {
    name: batch.name,
    createdAt: batch.createdAt,
    summary: batch.summary,
    results: batch.results.map(r => ({
      text: r.text,
      sentiment: r.sentiment,
      confidence: r.confidence,
      keywords: r.keywords,
      explanation: r.explanation
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `${batch.name}-sentiment-analysis.json`, 'application/json');
}

export function exportToPDF(batch: BatchResult): void {
  // Create a simple HTML-based PDF-like content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${batch.name} - Sentiment Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
    .stat-label { font-size: 12px; color: #64748b; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .neutral { color: #f59e0b; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; }
    .badge-positive { background: #dcfce7; color: #16a34a; }
    .badge-negative { background: #fee2e2; color: #dc2626; }
    .badge-neutral { background: #fef3c7; color: #f59e0b; }
  </style>
</head>
<body>
  <h1>📊 ${batch.name}</h1>
  <p style="color: #64748b;">Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h3 style="margin-top: 0;">Summary</h3>
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${batch.results.length}</div>
        <div class="stat-label">Total Texts</div>
      </div>
      <div class="stat">
        <div class="stat-value positive">${batch.summary.positive}</div>
        <div class="stat-label">Positive</div>
      </div>
      <div class="stat">
        <div class="stat-value negative">${batch.summary.negative}</div>
        <div class="stat-label">Negative</div>
      </div>
      <div class="stat">
        <div class="stat-value neutral">${batch.summary.neutral}</div>
        <div class="stat-label">Neutral</div>
      </div>
    </div>
    <p style="margin-bottom: 0; margin-top: 16px;">
      <strong>Average Confidence:</strong> ${(batch.summary.averageConfidence * 100).toFixed(1)}%
    </p>
  </div>

  <h3>Detailed Results</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Text</th>
        <th>Sentiment</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      ${batch.results.map(r => `
        <tr>
          <td>${r.text.length > 100 ? r.text.slice(0, 100) + '...' : r.text}</td>
          <td><span class="badge badge-${r.sentiment}">${r.sentiment}</span></td>
          <td>${(r.confidence * 100).toFixed(1)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
