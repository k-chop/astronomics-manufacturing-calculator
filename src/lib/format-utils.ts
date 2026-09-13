const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/**
 * Format duration in seconds to human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "25s", "1m 30s", "5m", "2h 5m", "1d 3h 4m 5s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < SECONDS_PER_MINUTE) return `${seconds}s`;

  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;

  const parts: string[] = [];
  if (days > 0) parts.push(`${formatNumber(days)}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
  return parts.join(" ");
}

/**
 * Format a number with thousands separators (e.g., 1000000 → "1,000,000")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
