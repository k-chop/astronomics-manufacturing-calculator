/**
 * Format duration in seconds to human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "25s", "1m 30s", "5m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}
