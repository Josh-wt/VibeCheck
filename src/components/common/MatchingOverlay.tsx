import { Loader2, Sparkles } from "lucide-react";

interface MatchingOverlayProps {
  message?: string;
}

const MatchingOverlay = ({ message = "Finding your perfect social group..." }: MatchingOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-primary animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            AI Analysis in Progress
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>This may take a few moments...</span>
        </div>
      </div>
    </div>
  );
};

export default MatchingOverlay;
