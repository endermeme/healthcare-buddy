import { ArrowLeft, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onBack: () => void;
  onClearChat: () => void;
  onTtsToggle?: (enabled: boolean) => void;
  ttsEnabled?: boolean;
}

export function ChatHeader({ 
  onBack,
  onClearChat,
  onTtsToggle,
  ttsEnabled = false
}: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Trò chuyện</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onTtsToggle?.(!ttsEnabled)}
            >
              {ttsEnabled ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClearChat}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}