import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TextInput } from '@/components/dashboard/TextInput';
import { SentimentResultCard } from '@/components/dashboard/SentimentResult';
import { BatchResults } from '@/components/dashboard/BatchResults';
import { ComparisonView } from '@/components/dashboard/ComparisonView';
import { AccuracyReport } from '@/components/dashboard/AccuracyReport';
import { ImageUpload } from '@/components/dashboard/ImageUpload';
import { analyzeSentiment, analyzeBatch } from '@/lib/sentimentAnalyzer';
import { SentimentResult, BatchResult } from '@/types/sentiment';
import { Layers, GitCompare, Plus, Trash2, Menu, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (text: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const result = analyzeSentiment(text);
      setCurrentResult(result);
      setIsLoading(false);
    }, 500);
  };

  const handleBatchAnalyze = (texts: string[]) => {
    setIsLoading(true);
    setTimeout(() => {
      const batch = analyzeBatch(texts, `Batch ${batchResults.length + 1}`);
      setBatchResults((prev) => [...prev, batch]);
      setActiveTab('batch');
      setIsLoading(false);
    }, 500);
  };

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatches((prev) => {
      if (prev.includes(batchId)) {
        return prev.filter((id) => id !== batchId);
      }
      if (prev.length >= 2) {
        return [prev[1], batchId];
      }
      return [...prev, batchId];
    });
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatchResults((prev) => prev.filter((b) => b.id !== batchId));
    setSelectedBatches((prev) => prev.filter((id) => id !== batchId));
  };

  const loadSampleData = () => {
    const sampleTexts = [
      "I absolutely love this product! Best purchase I've ever made.",
      "Terrible customer service. Waited for hours with no resolution.",
      "The product is okay, nothing special but gets the job done.",
      "Amazing experience! Will definitely recommend to friends.",
      "Very disappointed with the quality. Not worth the price.",
      "Fast shipping and exactly as described. Happy customer here!",
      "The app crashes constantly. Very frustrating user experience.",
      "Good value for money. Meets expectations.",
      "Outstanding support team! They went above and beyond.",
      "Wouldn't recommend. Poor packaging and arrived damaged.",
    ];
    
    const batch = analyzeBatch(sampleTexts, 'Sample Reviews');
    setBatchResults((prev) => [...prev, batch]);
    setActiveTab('batch');
  };

  const comparisonBatches = batchResults.filter((b) => selectedBatches.includes(b.id));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="bg-card border-b border-border sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TextInput
                    onAnalyze={handleAnalyze}
                    onBatchAnalyze={handleBatchAnalyze}
                    isLoading={isLoading}
                  />
                  <ImageUpload
                    onTextExtracted={handleAnalyze}
                    isLoading={isLoading}
                  />
                </div>

                {currentResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SentimentResultCard result={currentResult} />
                    <div className="card-dashboard p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Quick Tips
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Upload a .txt or .csv file for batch analysis
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Each line in the file will be analyzed separately
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Export results in CSV, JSON, or PDF format
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Compare multiple batches to track sentiment trends
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!currentResult && (
                  <div className="card-dashboard p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Start Analyzing
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Enter text above or upload a file to analyze sentiment. Get instant
                      insights into emotional tone with confidence scores and key drivers.
                    </p>
                    <Button variant="outline" onClick={loadSampleData}>
                      <Plus className="w-4 h-4 mr-2" />
                      Load Sample Data
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'batch' && (
              <div className="space-y-6">
                {batchResults.length === 0 ? (
                  <div className="card-dashboard p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Batch Results Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload a file with multiple texts or load sample data to get started.
                    </p>
                    <Button onClick={loadSampleData}>
                      <Plus className="w-4 h-4 mr-2" />
                      Load Sample Data
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Batch Results</h2>
                        <p className="text-sm text-muted-foreground">
                          {batchResults.length} batch{batchResults.length !== 1 ? 'es' : ''} analyzed
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedBatches.length === 2 && (
                          <Button
                            onClick={() => setActiveTab('compare')}
                            className="bg-primary text-primary-foreground"
                          >
                            <GitCompare className="w-4 h-4 mr-2" />
                            Compare Selected
                          </Button>
                        )}
                        <Button variant="outline" onClick={loadSampleData}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Sample Data
                        </Button>
                      </div>
                    </div>

                    {selectedBatches.length > 0 && selectedBatches.length < 2 && (
                      <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
                        Select one more batch to enable comparison view
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {batchResults.map((batch) => (
                        <div
                          key={batch.id}
                          className={`card-dashboard p-4 cursor-pointer transition-all ${
                            selectedBatches.includes(batch.id)
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                          onClick={() => handleSelectBatch(batch.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-foreground">{batch.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBatch(batch.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold text-sentiment-positive">
                                {batch.summary.positive}
                              </p>
                              <p className="text-xs text-muted-foreground">Positive</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-sentiment-negative">
                                {batch.summary.negative}
                              </p>
                              <p className="text-xs text-muted-foreground">Negative</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-sentiment-neutral">
                                {batch.summary.neutral}
                              </p>
                              <p className="text-xs text-muted-foreground">Neutral</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {batchResults.length > 0 && (
                      <BatchResults batch={batchResults[batchResults.length - 1]} />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'compare' && comparisonBatches.length === 2 && (
              <ComparisonView source1={comparisonBatches[0]} source2={comparisonBatches[1]} />
            )}

            {activeTab === 'accuracy' && <AccuracyReport />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
