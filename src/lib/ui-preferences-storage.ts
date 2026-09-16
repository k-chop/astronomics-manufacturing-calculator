const SHOW_ROUTE_KEY = "astronomics-show-route";
const SHOW_CONTRACTS_KEY = "astronomics-show-contracts";

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

/**
 * 契約（Contracts）をカタログと Used in に出すかどうか（初期値は OFF。ゲーム内で順に開示されるもののネタバレ対策）
 */
export function loadShowContracts(): boolean {
  try {
    return localStorage.getItem(SHOW_CONTRACTS_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveShowContracts(show: boolean): void {
  try {
    localStorage.setItem(SHOW_CONTRACTS_KEY, String(show));
  } catch (error) {
    console.error("Failed to save contracts preference:", error);
  }
}
