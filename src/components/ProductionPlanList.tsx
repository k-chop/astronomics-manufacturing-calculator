import { useState } from "react";
import { getItemName, type Locale } from "../data/item-names";
import type { ProductionPlan } from "../types/production-plan";
import { ItemWithTooltip } from "./ItemWithTooltip";

type ProductionPlanListProps = {
  plan: ProductionPlan;
  onRemoveItem: (itemId: string) => void;
  onToggleCompletion: (itemId: string) => void;
  onUpdateMaterialProgress: (
    itemId: string,
    materialId: string,
    collected: number,
  ) => void;
  locale?: Locale;
};

export function ProductionPlanList({
  plan,
  onRemoveItem,
  onToggleCompletion,
  onUpdateMaterialProgress,
  locale = "en",
}: ProductionPlanListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  if (plan.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Production Plan</h2>
        <p className="text-gray-500 text-sm">
          No items in the plan yet. Add items from the calculator on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Production Plan</h2>
      <div className="space-y-3">
        {plan.items.map((item) => {
          const selectedResult = item.calculationResults[item.selectedPatternIndex];
          const totalMaterials = selectedResult.totalItems.length;
          const collectedCount = Object.values(item.materialProgress).filter(
            (p) => p.collected >= p.required,
          ).length;

          const isExpanded = expandedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`border rounded-lg p-4 ${
                item.completed
                  ? "bg-gray-50 border-gray-300 opacity-60"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {
                      onToggleCompletion(item.id);
                      // 完了時にdetailsを閉じる
                      if (!item.completed && expandedItems.has(item.id)) {
                        toggleExpand(item.id);
                      }
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div
                      className={`font-semibold text-lg ${
                        item.completed ? "line-through text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {item.amount} × {getItemName(item.itemId, locale)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Materials: {collectedCount}/{totalMaterials} collected
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Pattern {item.selectedPatternIndex + 1} (
                      {selectedResult.totalDuration}s)
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Material Progress Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    Material Collection Progress:
                  </div>
                  <div className="space-y-2">
                    {selectedResult.totalItems.map((material) => {
                      const progress = item.materialProgress[material.item];
                      const isComplete = progress.collected >= progress.required;

                      return (
                        <div
                          key={material.item}
                          className={`flex items-center gap-3 p-2 rounded ${
                            isComplete ? "bg-green-50" : "bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isComplete}
                            onChange={() =>
                              onUpdateMaterialProgress(
                                item.id,
                                material.item,
                                isComplete ? 0 : progress.required,
                              )
                            }
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <div className="flex-1">
                            <ItemWithTooltip
                              itemId={material.item}
                              locale={locale}
                              className={isComplete ? "line-through text-gray-500" : ""}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={progress.required}
                              value={progress.collected}
                              onChange={(e) =>
                                onUpdateMaterialProgress(
                                  item.id,
                                  material.item,
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">
                              / {progress.required}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
