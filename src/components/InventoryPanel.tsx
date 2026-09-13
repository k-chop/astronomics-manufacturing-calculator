import type { Locale } from "../data/item-names";
import { formatNumber } from "../lib/format-utils";
import { getEntryTitle } from "../lib/plan-format";
import type { InventoryRow, ReadyCraft } from "../lib/production-plan-utils";
import { formatItemStacks } from "../lib/recipe-format";
import { ItemWithTooltip } from "./ItemWithTooltip";

type InventoryPanelProps = {
  rows: InventoryRow[];
  craftsByInput: Map<string, ReadyCraft[]>;
  onUpdateInventory: (itemId: string, amount: number) => void;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale?: Locale;
};

const runButtonClass =
  "px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap";

export function InventoryPanel({
  rows,
  craftsByInput,
  onUpdateInventory,
  onRecordStepRuns,
  locale = "en",
}: InventoryPanelProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
      <h2 className="text-xl font-bold mb-1 text-gray-900">Materials &amp; Inventory</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter what you have. Required is the total for all incomplete entries in your plan, including intermediates your
        remaining steps will craft.
      </p>
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col />
          <col className="w-20" />
          <col className="w-24" />
          <col className="w-20" />
        </colgroup>
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="py-1 pr-2 font-medium">Item</th>
            <th className="py-1 px-1 font-medium text-right">Required</th>
            <th className="py-1 px-1 font-medium text-right">Have</th>
            <th className="py-1 px-1 font-medium text-right">Missing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const crafts = craftsByInput.get(row.item) ?? [];
            return (
              <tr key={row.item} className="border-t border-blue-100 align-top">
                <td className="py-1.5 pr-2 break-words">
                  <ItemWithTooltip itemId={row.item} locale={locale} className="font-medium text-gray-700" />
                  {crafts.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {crafts.map((craft) => (
                        <div
                          key={`${craft.entry.id}:${craft.stepIndex}`}
                          className="flex items-center gap-2 flex-wrap text-xs"
                          title={`${getEntryTitle(craft.entry, locale)} · ${formatItemStacks(craft.recipe.inputs, locale)}`}
                        >
                          <span className="text-green-700">
                            → {formatItemStacks(craft.recipe.outputs, locale)} ({formatNumber(craft.runs)}×)
                          </span>
                          <button
                            type="button"
                            onClick={() => onRecordStepRuns(craft.entry.id, craft.stepIndex, 1)}
                            className={runButtonClass}
                          >
                            Run ×1
                          </button>
                          {craft.runs > 1 && (
                            <button
                              type="button"
                              onClick={() => onRecordStepRuns(craft.entry.id, craft.stepIndex, craft.runs)}
                              className={runButtonClass}
                            >
                              Run ×{formatNumber(craft.runs)}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-1.5 px-1 text-right font-mono text-gray-700 whitespace-nowrap">
                  {formatNumber(row.required)}
                </td>
                <td className="py-1.5 px-1 text-right">
                  <input
                    type="number"
                    min="0"
                    value={row.have}
                    aria-label={`Have ${row.item}`}
                    onChange={(e) => onUpdateInventory(row.item, Number(e.target.value))}
                    className="w-full px-1.5 py-1 text-sm text-right font-mono border border-gray-300 rounded bg-white"
                  />
                </td>
                <td className="py-1.5 px-1 text-right font-mono font-bold whitespace-nowrap">
                  {row.missing > 0 ? (
                    <span className="text-red-600">{formatNumber(row.missing)}</span>
                  ) : row.have >= row.required ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400 font-normal" title="Covered by crafting from what you have">
                      craft
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
