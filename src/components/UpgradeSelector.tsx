import type { Locale } from "../data/item-names";
import { getUpgradeCategoryName, type UpgradeCategory, upgrades } from "../data/upgrades";

export type SelectedUpgrade = {
  upgradeId: string;
  level: number;
};

type UpgradeSelectorProps = {
  selected: SelectedUpgrade | null;
  onSelect: (upgradeId: string, level: number) => void;
  locale?: Locale;
};

const categories: UpgradeCategory[] = ["freighter", "shuttle"];

export function UpgradeSelector({ selected, onSelect, locale = "en" }: UpgradeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="block text-sm font-medium text-gray-700 mb-2">Which upgrade do you want?</div>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {getUpgradeCategoryName(category, locale)}
            </div>
            <div className="space-y-2">
              {upgrades
                .filter((upgrade) => upgrade.category === category)
                .map((upgrade) => (
                  <div key={upgrade.id} className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm text-gray-800">{upgrade.name[locale] || upgrade.name.en}</div>
                    <div className="flex gap-1">
                      {upgrade.levels.map((upgradeLevel) => {
                        const isSelected = selected?.upgradeId === upgrade.id && selected.level === upgradeLevel.level;
                        return (
                          <button
                            type="button"
                            key={upgradeLevel.level}
                            onClick={() => onSelect(upgrade.id, upgradeLevel.level)}
                            className={`px-2.5 py-1 text-xs font-medium rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            Lv{upgradeLevel.level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
