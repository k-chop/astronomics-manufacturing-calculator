const SHOW_ROUTE_KEY = "astronomics-show-route";

/**
 * 「Where to go」の経路提案を出すかどうか（初期値は OFF）
 */
export function loadShowRoute(): boolean {
  try {
    return localStorage.getItem(SHOW_ROUTE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveShowRoute(show: boolean): void {
  try {
    localStorage.setItem(SHOW_ROUTE_KEY, String(show));
  } catch (error) {
    console.error("Failed to save route preference:", error);
  }
}
