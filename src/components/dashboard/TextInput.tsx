import { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextInputProps {
  onAnalyze: (text: string) => void;
  onBatchAnalyze: (texts: string[]) => void;
  isLoading?: boolean;
}

const MAX_WORDS = 500;

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export function TextInput({ onAnalyze, onBatchAnalyze, isLoading }: TextInputProps) {
  const [text, setText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(text);
  const isOverLimit = wordCount > MAX_WORDS;

  const handleTextChange = (value: string) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length <= MAX_WORDS) {
      setText(value);
    }
  };

  const handleAnalyze = () => {
    if (text.trim() && !isOverLimit) {
      onAnalyze(text.trim());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
      onBatchAnalyze(lines);
    } else {
      setText(content);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-dashboard p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Text Input</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter text to analyze sentiment... (e.g., customer reviews, social media posts, feedback)"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[150px] resize-none bg-background border-border focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex justify-end">
            <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {wordCount}/{MAX_WORDS} words
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </span>
              </Button>
            </label>

            {uploadedFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{uploadedFile.name}</span>
                <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!text.trim() || isLoading || isOverLimit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Supports .txt and .csv files. Multiple lines will be processed as batch analysis.
        </p>
      </div>
    </div>
  );
}
