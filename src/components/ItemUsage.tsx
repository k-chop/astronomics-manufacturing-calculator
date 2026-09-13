import { getItemName, type Locale } from "../data/item-names";
import { getUpgradeName } from "../data/upgrades";
import { formatDuration, formatNumber } from "../lib/format-utils";
import { findRecipesUsingItem, findUpgradesRequiringItem } from "../lib/item-usage";
import { formatRecipe } from "../lib/recipe-format";

type ItemUsageProps = {
  itemId: string;
  onSelectItem: (itemId: string) => void;
  onSelectUpgrade: (upgradeId: string, level: number) => void;
  locale?: Locale;
};

const rowClass =
  "w-full text-left border border-gray-200 rounded p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function ItemUsage({ itemId, onSelectItem, onSelectUpgrade, locale = "en" }: ItemUsageProps) {
  const recipeUsages = findRecipesUsingItem(itemId);
  const upgradeUsages = findUpgradesRequiringItem(itemId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-lg font-semibold mb-4">Used in</div>

      {recipeUsages.length === 0 && upgradeUsages.length === 0 && (
        <p className="text-sm text-gray-500">This item is not used in any recipe or upgrade.</p>
      )}

      {recipeUsages.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-2 text-sm text-gray-700">Recipes:</div>
          <div className="space-y-2">
            {recipeUsages.map((usage) => (
              <button
                type="button"
                key={`${usage.outputItem}:${usage.method.machine}:${usage.method.inputs.map((i) => i.item).join(",")}`}
                onClick={() => onSelectItem(usage.outputItem)}
                className={rowClass}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-blue-700">{getItemName(usage.outputItem, locale)}</span>
                  {usage.viaAlias && (
                    <span className="text-xs text-gray-500">as {getItemName(usage.viaAlias, locale)}</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatRecipe(
                    {
                      machine: usage.method.machine,
                      inputs: usage.method.inputs,
                      outputs: [{ item: usage.outputItem, amount: usage.method.amount }],
                    },
                    locale,
                  )}{" "}
                  ({formatDuration(usage.method.duration)})
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {upgradeUsages.length > 0 && (
        <div>
          <div className="font-semibold mb-2 text-sm text-gray-700">Upgrades:</div>
          <div className="space-y-2">
            {upgradeUsages.map((usage) => (
              <button
                type="button"
                key={`${usage.upgradeId}:${usage.level}`}
                onClick={() => onSelectUpgrade(usage.upgradeId, usage.level)}
                className={rowClass}
              >
                <span className="font-medium text-purple-700">
                  {getUpgradeName(usage.upgradeId, locale)} Lv{usage.level}
                </span>
                <span className="text-xs text-gray-600 ml-2">
                  {getItemName(itemId, locale)} ×{formatNumber(usage.amount)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
