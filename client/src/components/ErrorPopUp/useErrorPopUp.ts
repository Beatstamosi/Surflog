// hooks/useErrorPopup.ts
import { useState } from "react";

export function useErrorPopup() {
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showError = (message: string) => {
    setError(message);
    setIsVisible(true);
  };

  const closeError = () => {
    setIsVisible(false);
    // Clear error after animation if needed
    setTimeout(() => setError(null), 300);
  };

  return {
    showError,
    closeError,
    error,
    isErrorVisible: isVisible
  };
}