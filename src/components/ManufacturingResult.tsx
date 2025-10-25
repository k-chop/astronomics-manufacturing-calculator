import { getItemName } from "../data/item-names";
import type { CalculationResult } from "../lib/calculator";

type ManufacturingResultProps = {
  results: CalculationResult[];
  targetItem: string;
  targetAmount: number;
  locale?: string;
};

export function ManufacturingResult({
  results,
  targetItem,
  targetAmount,
  locale = "en",
}: ManufacturingResultProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold">
        Manufacturing {targetAmount} × {getItemName(targetItem, locale)}
      </div>

      {results.map((result, patternIndex) => (
        <div
          key={patternIndex}
          className="border border-gray-300 rounded-lg p-4 bg-white shadow"
        >
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="text-sm text-gray-600">Pattern {patternIndex + 1}</div>
            <div className="text-xl font-bold text-blue-600">
              Total Time: {formatDuration(result.totalDuration)}
            </div>
          </div>

          {/* Required Raw Materials */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Required Raw Materials:</div>
            <div className="space-y-1">
              {result.totalItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-700">{getItemName(item.item, locale)}</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                    × {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Manufacturing Steps */}
          <div>
            <div className="font-semibold mb-2">Manufacturing Steps:</div>
            <div className="space-y-3">
              {result.recipes.map((recipe, recipeIdx) => (
                <div
                  key={recipeIdx}
                  className="border border-gray-200 rounded p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-blue-700">
                      {recipe.machine.charAt(0).toUpperCase() + recipe.machine.slice(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDuration(recipe.duration)} × {recipe.count} ={" "}
                      {formatDuration(recipe.duration * recipe.count)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center text-sm">
                    {/* Inputs */}
                    <div className="space-y-1">
                      {recipe.inputs.map((input, idx) => (
                        <div key={idx} className="text-gray-700">
                          {getItemName(input.item, locale)}
                          <span className="font-mono text-xs ml-1">
                            × {input.amount}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="text-center text-gray-400">
                      <div className="text-xs mb-1">× {recipe.count} times</div>
                      <div>→</div>
                    </div>

                    {/* Outputs */}
                    <div className="space-y-1">
                      {recipe.outputs.map((output, idx) => (
                        <div key={idx} className="text-gray-700 font-medium">
                          {getItemName(output.item, locale)}
                          <span className="font-mono text-xs ml-1">
                            × {output.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Total produced: {recipe.outputs[0].amount * recipe.count} ×{" "}
                    {getItemName(recipe.outputs[0].item, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
