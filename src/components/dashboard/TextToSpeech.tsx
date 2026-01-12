import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (!isSupported) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSpeak}
        className="gap-2"
      >
        {isSpeaking && !isPaused ? (
          <>
            <Pause className="w-4 h-4" />
            Pause
          </>
        ) : isPaused ? (
          <>
            <Play className="w-4 h-4" />
            Resume
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            Read Aloud
          </>
        )}
      </Button>
      
      {isSpeaking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStop}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <VolumeX className="w-4 h-4" />
          Stop
        </Button>
      )}
    </div>
  );
}
