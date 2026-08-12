/** Trace countdown is critical once 30 seconds or fewer remain. */
export function isTraceTimerCritical(timeRemaining: number): boolean {
  return Number.isFinite(timeRemaining) && timeRemaining <= 30;
}
