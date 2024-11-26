import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioMessageProps {
  audioUrl: string;
  transcription: string;
}

export const AudioMessage = ({ audioUrl, transcription }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 mx-px h-1 bg-primary transform transition-all duration-75 ${
                  isPlaying ? 'animate-wave' : ''
                }`}
                style={{
                  animationDelay: `${i * 50}ms`,
                  height: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
        
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
      
      <p className="text-sm text-gray-600 italic">
        {transcription}
      </p>
    </div>
  );
};