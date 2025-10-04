import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <XCircle className="h-16 w-16 md:h-20 md:w-20 text-destructive mx-auto" strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Something went wrong
      </h2>
      <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md">
        We couldn't connect to the server (API error). Please try again in a few moments.
      </p>
      <Button 
        onClick={onRetry}
        size="lg"
        className="px-8 rounded-2xl hover:scale-105 transition-all"
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Retry
      </Button>
    </div>
  );
};
