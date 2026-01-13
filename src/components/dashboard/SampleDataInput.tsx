import { useState, useRef } from 'react';
import { Plus, X, Database, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SampleDataInputProps {
  onBatchAnalyze: (texts: string[]) => void;
  isLoading?: boolean;
}

export function SampleDataInput({ onBatchAnalyze, isLoading }: SampleDataInputProps) {
  const [samples, setSamples] = useState<string[]>(['']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSample = () => {
    setSamples((prev) => [...prev, '']);
  };

  const removeSample = (index: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSample = (index: number, value: string) => {
    setSamples((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let newSamples: string[] = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV - each line is a sample
        newSamples = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      } else if (file.name.endsWith('.txt')) {
        // Parse TXT - split by double newlines or single lines
        newSamples = content
          .split(/\n\n|\r\n\r\n/)
          .map((line) => line.trim().replace(/\n/g, ' '))
          .filter((line) => line.length > 0);
      } else if (file.name.endsWith('.json')) {
        // Parse JSON - expect array of strings
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            newSamples = parsed.filter((item) => typeof item === 'string' && item.trim());
          }
        } catch {
          console.error('Invalid JSON file');
        }
      }

      if (newSamples.length > 0) {
        setSamples((prev) => {
          const existing = prev.filter((s) => s.trim());
          return [...existing, ...newSamples];
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    const validSamples = samples.filter((s) => s.trim());
    if (validSamples.length > 0) {
      onBatchAnalyze(validSamples);
      setSamples(['']);
    }
  };

  const validSamplesCount = samples.filter((s) => s.trim()).length;

  return (
    <div className="card-dashboard p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Add Sample Data</h2>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
        {samples.map((sample, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-[24px]">{index + 1}.</span>
            <Input
              placeholder="Enter sample text..."
              value={sample}
              onChange={(e) => updateSample(index, e.target.value)}
              className="flex-1"
            />
            {samples.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSample(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={addSample} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Sample
        </Button>

        <Button
          onClick={handleAnalyze}
          disabled={validSamplesCount === 0 || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Analyzing...' : `Analyze ${validSamplesCount} Sample${validSamplesCount !== 1 ? 's' : ''}`}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Add text samples manually or upload a file (.csv, .txt, .json). Each sample will be analyzed separately.
      </p>
    </div>
  );
}
