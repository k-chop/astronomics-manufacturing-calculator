import { getContractName } from "../data/contracts";
import { getItemName, type Locale } from "../data/item-names";
import { getUpgradeName } from "../data/upgrades";
import type { ProductionPlanEntry } from "../types/production-plan";
import { formatNumber } from "./format-utils";

/**
 * プランエントリの見出し（"20 × Graphite" / "Fuel Capacity Lv2" / "Raw Chromite Delivery"）
 */
export function getEntryTitle(entry: ProductionPlanEntry, locale: Locale = "en"): string {
  switch (entry.kind) {
    case "item":
      return `${formatNumber(entry.amount)} × ${getItemName(entry.itemId, locale)}`;
    case "upgrade":
      return `${getUpgradeName(entry.upgradeId, locale)} Lv${entry.level}`;
    case "contract":
      return getContractName(entry.contractId, locale);
  }
}
