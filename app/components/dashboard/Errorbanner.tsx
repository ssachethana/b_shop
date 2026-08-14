import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <p className="text-sm text-red-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700 underline"
      >
        Retry
      </button>
    </div>
  );
}