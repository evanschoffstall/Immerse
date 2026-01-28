/**
 * Formats a date as a human-readable "time ago" string.
 * Shows "Today", "Yesterday", or "X days ago" for recent dates,
 * and falls back to locale date string for older dates.
 *
 * @param date - The date to format
 * @returns A formatted string describing how long ago the date was
 *
 * @example
 * formatTimeAgo(new Date()) // "Today"
 * formatTimeAgo(new Date(Date.now() - 86400000)) // "Yesterday"
 * formatTimeAgo(new Date(Date.now() - 259200000)) // "3 days ago"
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}
