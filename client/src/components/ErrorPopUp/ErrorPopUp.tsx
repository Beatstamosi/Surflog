import { useEffect } from "react";
import style from "./ErrorPopUp.module.css";

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
  duration?: number; // optional auto-close duration in ms
}

export default function ErrorPopup({
  message,
  onClose,
  duration = 5000,
}: ErrorPopupProps) {
  useEffect(() => {
    console.log("ErrorPopup mounted with message:", message);

    if (duration > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-closing error popup");
        onClose();
      }, duration);

      return () => {
        console.log("ErrorPopup cleanup");
        clearTimeout(timer);
      };
    }
  }, [duration, onClose, message]);

  return (
    <div className={style.errorOverlay}>
      <div className={style.errorPopup}>
        <div className={style.errorHeader}>
          <span className={style.errorIcon}>⚠️</span>
          <h3 className={style.errorTitle}>Error</h3>
          <button className={style.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={style.errorContent}>
          <p className={style.errorMessage}>{message}</p>
        </div>
      </div>
    </div>
  );
}
