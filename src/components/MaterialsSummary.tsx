import type { ItemStack } from "../data/recipes";
import { ItemWithTooltip } from "./ItemWithTooltip";

type MaterialsSummaryProps = {
  materials: ItemStack[];
  locale?: string;
};

export function MaterialsSummary({
  materials,
  locale = "en",
}: MaterialsSummaryProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Total Materials Needed
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Aggregated materials for all incomplete items in your plan
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {materials.map((material) => (
          <div
            key={material.item}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <ItemWithTooltip
                itemId={material.item}
                locale={locale}
                className="text-sm font-medium text-gray-700"
              />
              <span className="font-mono text-lg font-bold text-blue-600 ml-2">
                {material.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
