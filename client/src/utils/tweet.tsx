import { toaster } from "./toaster";

export const MAX_TWEET_LENGTH = 280;
export const WARN_THRESHOLD = 260;
export const TOAST_ERROR_DURATION = 4000;
export const TOAST_SUCCESS_DURATION = 3000;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", DATE_FORMAT_OPTIONS);
}

export function showError(message: string) {
  toaster.create({
    title: "Erreur",
    description: message,
    type: "error",
    duration: TOAST_ERROR_DURATION,
  });
}
