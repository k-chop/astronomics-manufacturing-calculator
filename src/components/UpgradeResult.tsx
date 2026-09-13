import { getItemName, type Locale } from "../data/item-names";
import { getUpgradeLevel, getUpgradeName } from "../data/upgrades";
import { getUpgradeRequirementMaterials, resolveUpgradeRequirements } from "../lib/production-plan-utils";
import { ItemWithTooltip } from "./ItemWithTooltip";

type UpgradeResultProps = {
  upgradeId: string;
  level: number;
  onAddToPlan: () => void;
  locale?: Locale;
};

export function UpgradeResult({ upgradeId, level, onAddToPlan, locale = "en" }: UpgradeResultProps) {
  const upgradeLevel = getUpgradeLevel(upgradeId, level);
  if (!upgradeLevel) return null;

  const requirements = resolveUpgradeRequirements(upgradeLevel.requirements);
  const materials = getUpgradeRequirementMaterials(requirements);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold">
              {getUpgradeName(upgradeId, locale)} Lv{level}
            </div>
            <div className="text-sm text-gray-600">{upgradeLevel.credits}◆</div>
          </div>
          <button
            type="button"
            onClick={onAddToPlan}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium shadow-md"
          >
            Add to Plan
          </button>
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Requirements:</div>
          <div className="space-y-2">
            {requirements.map((requirement) => (
              <div key={requirement.item} className="border border-gray-200 rounded p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <ItemWithTooltip itemId={requirement.item} locale={locale} className="text-gray-700 font-medium" />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">× {requirement.amount}</span>
                </div>
                {requirement.calculationResults !== null && (
                  <div className="mt-1 text-xs text-gray-500">
                    →{" "}
                    {requirement.calculationResults[0].totalItems
                      .map((material) => `${getItemName(material.item, locale)} × ${material.amount}`)
                      .join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Required Raw Materials */}
        <div>
          <div className="font-semibold mb-2">Required Raw Materials:</div>
          <div className="space-y-1">
            {materials.map((material) => (
              <div key={material.item} className="flex items-center gap-2">
                <ItemWithTooltip itemId={material.item} locale={locale} className="text-gray-700" />
                <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">× {material.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
