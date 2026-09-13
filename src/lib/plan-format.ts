import { getItemName, type Locale } from "../data/item-names";
import { getUpgradeName } from "../data/upgrades";
import type { ProductionPlanEntry } from "../types/production-plan";
import { formatNumber } from "./format-utils";

/**
 * プランエントリの見出し（"20 × Graphite" / "Fuel Capacity Lv2"）
 */
export function getEntryTitle(entry: ProductionPlanEntry, locale: Locale = "en"): string {
  return entry.kind === "item"
    ? `${formatNumber(entry.amount)} × ${getItemName(entry.itemId, locale)}`
    : `${getUpgradeName(entry.upgradeId, locale)} Lv${entry.level}`;
}
