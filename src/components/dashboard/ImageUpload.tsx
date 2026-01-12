import { useState, useRef } from 'react';
import { ImageIcon, Loader2, X, ScanText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker } from 'tesseract.js';

interface ImageUploadProps {
  onTextExtracted: (text: string) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onTextExtracted, isLoading }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setError(null);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const extractText = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(selectedImage);
      await worker.terminate();

      if (text.trim()) {
        onTextExtracted(text.trim());
        clearImage();
      } else {
        setError('No text found in the image. Please try another image.');
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError('Failed to extract text from image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-dashboard p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Image Text Analysis</h2>
      </div>

      <div className="space-y-4">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ScanText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    Extract text from images for sentiment analysis
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <span>Choose Image</span>
                </Button>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <img
                src={selectedImage}
                alt="Selected for OCR"
                className="w-full max-h-64 object-contain"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting text... {progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={extractText}
              disabled={isProcessing || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ScanText className="w-4 h-4 mr-2" />
                  Extract & Analyze Text
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Supports PNG, JPG, JPEG, GIF, and WebP images. Works best with clear, high-contrast text.
        </p>
      </div>
    </div>
  );
}
