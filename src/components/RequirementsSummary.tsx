import type { Locale } from "../data/item-names";
import { formatNumber } from "../lib/format-utils";
import { getRequirementMaterials } from "../lib/production-plan-utils";
import { formatItemStacks } from "../lib/recipe-format";
import type { PlanRequirement } from "../types/production-plan";
import { ItemWithTooltip } from "./ItemWithTooltip";

type RequirementsSummaryProps = {
  requirements: PlanRequirement[];
  locale: Locale;
};

/**
 * upgrade / contract の詳細に出す「要求資源」と「原材料まで展開した合計」
 */
export function RequirementsSummary({ requirements, locale }: RequirementsSummaryProps) {
  const materials = getRequirementMaterials(requirements);

  return (
    <>
      {/* Requirements */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Requirements:</div>
        <div className="space-y-2">
          {requirements.map((requirement) => (
            <div key={requirement.item} className="border border-gray-200 rounded p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <ItemWithTooltip itemId={requirement.item} locale={locale} className="text-gray-700 font-medium" />
                <span className="font-mono text-base bg-gray-100 px-2 py-0.5 rounded">
                  × {formatNumber(requirement.amount)}
                </span>
              </div>
              {requirement.calculationResults !== null && (
                <div className="mt-1 text-sm text-gray-500">
                  → {formatItemStacks(requirement.calculationResults[0].totalItems, locale, ", ")}
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
              <span className="font-mono text-base bg-gray-100 px-2 py-0.5 rounded">
                × {formatNumber(material.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
