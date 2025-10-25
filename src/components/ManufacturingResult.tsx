import { getItemName } from "../data/item-names";
import type { CalculationResult } from "../lib/calculator";
import { formatDuration } from "../lib/format-utils";
import { ItemWithTooltip } from "./ItemWithTooltip";

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

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold">
        Manufacturing {targetAmount} × {getItemName(targetItem, locale)}
      </div>

      {results.map((result, patternIndex) => (
        <div
          key={`pattern-${patternIndex}-${result.totalDuration}`}
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
              {result.totalItems.map((item) => (
                <div key={item.item} className="flex items-center gap-2">
                  <ItemWithTooltip
                    itemId={item.item}
                    locale={locale}
                    className="text-gray-700"
                    alwaysShowUnderline
                  />
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
                  key={`recipe-${recipeIdx}-${recipe.machine}-${recipe.outputs[0].item}`}
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
                      {recipe.inputs.map((input) => (
                        <div key={input.item} className="text-gray-700">
                          <ItemWithTooltip itemId={input.item} locale={locale} />
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
                      {recipe.outputs.map((output) => (
                        <div key={output.item} className="text-gray-700 font-medium">
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
