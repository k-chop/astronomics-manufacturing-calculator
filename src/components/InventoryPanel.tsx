import { Fragment } from "react";

import type { Locale } from "../data/item-names";
import { formatNumber } from "../lib/format-utils";
import { getEntryTitle } from "../lib/plan-format";
import type { InventoryRow, ReadyCraft } from "../lib/production-plan-utils";
import { formatItemStacks } from "../lib/recipe-format";
import { ItemWithTooltip } from "./ItemWithTooltip";

type InventoryPanelProps = {
  rows: InventoryRow[];
  craftsByOutput: Map<string, ReadyCraft[]>; // 出力アイテム id → 今実行できる製造ステップ
  onUpdateInventory: (itemId: string, amount: number) => void;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale?: Locale;
};

// Have 列の入力欄と同じ上下パディング・枠線幅を持たせて、他の列の文字の高さを入力欄の文字に揃える
const cellTextClass = "py-1 border border-transparent";

const runButtonClass =
  "px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap";

export function InventoryPanel({
  rows,
  craftsByOutput,
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
          {rows.map((row, index) => {
            const crafts = craftsByOutput.get(row.item) ?? [];
            // 集めるもの → 作るもの の順に並んでいるので、各グループの先頭に見出し行を入れる
            const startsGroup = index === 0 || rows[index - 1].crafted !== row.crafted;
            return (
              <Fragment key={row.item}>
                {startsGroup && (
                  <tr>
                    <td colSpan={4} className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {row.crafted ? "Craft" : "Collect"}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-blue-100 align-top">
                  <td className="py-1.5 pr-2 break-words">
                    <div className={cellTextClass}>
                      <ItemWithTooltip itemId={row.item} locale={locale} className="font-medium text-gray-700" />
                    </div>
                    {crafts.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {crafts.map((craft) => (
                          <div
                            key={`${craft.entry.id}:${craft.stepIndex}`}
                            className="flex items-center gap-2 flex-wrap text-xs"
                            title={`${getEntryTitle(craft.entry, locale)} · ${formatItemStacks(craft.recipe.inputs, locale)} → ${formatItemStacks(craft.recipe.outputs, locale)}`}
                          >
                            <span className="text-green-700">
                              ← {formatItemStacks(craft.recipe.inputs, locale)} ({formatNumber(craft.runs)}×)
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
                    <div className={cellTextClass}>{formatNumber(row.required)}</div>
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
                    <div className={cellTextClass}>
                      {row.missing > 0 ? (
                        <span className="text-red-600">{formatNumber(row.missing)}</span>
                      ) : row.have >= row.required ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400 font-normal" title="Covered by crafting from what you have">
                          craft
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
