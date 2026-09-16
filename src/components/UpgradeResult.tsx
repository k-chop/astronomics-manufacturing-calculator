import type { Locale } from "../data/item-names";
import { getUpgradeLevel, getUpgradeName } from "../data/upgrades";
import { formatNumber } from "../lib/format-utils";
import { resolveRequirements } from "../lib/production-plan-utils";
import { AddToPlanButton } from "./AddToPlanButton";
import { RequirementsSummary } from "./RequirementsSummary";

type UpgradeResultProps = {
  upgradeId: string;
  level: number;
  onAddToPlan: () => void;
  locale?: Locale;
};

export function UpgradeResult({ upgradeId, level, onAddToPlan, locale = "en" }: UpgradeResultProps) {
  const upgradeLevel = getUpgradeLevel(upgradeId, level);
  if (!upgradeLevel) return null;

  const requirements = resolveRequirements(upgradeLevel.requirements);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-semibold">
              {getUpgradeName(upgradeId, locale)} Lv{level}
            </div>
            <div className="text-base text-gray-600">{formatNumber(upgradeLevel.credits)}◆</div>
          </div>
          <AddToPlanButton subtitle={`${getUpgradeName(upgradeId, locale)} Lv${level}`} onClick={onAddToPlan} />
        </div>

        <RequirementsSummary requirements={requirements} locale={locale} />
      </div>
    </div>
  );
}
