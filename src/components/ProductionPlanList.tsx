import { useState } from "react";

import { getItemName, type Locale } from "../data/item-names";
import { getUpgradeName } from "../data/upgrades";
import { getRecipeKey } from "../lib/calculator";
import { formatDuration, formatNumber } from "../lib/format-utils";
import { formatRecipe } from "../lib/plan-format";
import { analyzeEntry, isMaterialsCovered, isReadyToFinish } from "../lib/production-plan-utils";
import type { Inventory, ProductionPlan, ProductionPlanEntry } from "../types/production-plan";
import { ItemWithTooltip } from "./ItemWithTooltip";

type ProductionPlanListProps = {
  plan: ProductionPlan;
  onRemoveItem: (entryId: string) => void;
  onToggleCompletion: (entryId: string) => void;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale?: Locale;
};

function EntryTitle({
  entry,
  inventory,
  locale,
}: {
  entry: ProductionPlanEntry;
  inventory: Inventory;
  locale: Locale;
}) {
  const titleClass = `font-semibold text-lg ${entry.completed ? "line-through text-gray-500" : "text-gray-900"}`;

  if (entry.kind === "item") {
    return (
      <div className={titleClass}>
        {formatNumber(entry.amount)} × {getItemName(entry.itemId, locale)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={titleClass}>
          {getUpgradeName(entry.upgradeId, locale)} Lv{entry.level}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">Upgrade</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {entry.requirements.map((requirement) => {
          const have = inventory[requirement.item] ?? 0;
          const satisfied = entry.completed || have >= requirement.amount;
          return (
            <span key={requirement.item} className={satisfied ? "text-green-700" : ""}>
              {getItemName(requirement.item, locale)}{" "}
              <span className="font-mono">
                {satisfied ? "" : `${formatNumber(have)}/`}
                {formatNumber(requirement.amount)}
              </span>
              {satisfied && " ✓"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

type EntryDetailsProps = {
  entry: ProductionPlanEntry;
  inventory: Inventory;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale: Locale;
};

function EntryDetails({ entry, inventory, onRecordStepRuns, locale }: EntryDetailsProps) {
  const { steps, materials: statuses } = analyzeEntry(entry, inventory);
  // upgrade では複数の要求資源のレシピを連結しているので、同じレシピが並ぶ場合は出現回数で区別する
  const seenKeys = new Map<string, number>();
  const stepKeys = steps.map((step) => {
    const base = getRecipeKey(step.recipe);
    const seen = seenKeys.get(base) ?? 0;
    seenKeys.set(base, seen + 1);
    return seen === 0 ? base : `${base}#${seen}`;
  });
  const stepButtonClass =
    "w-7 h-7 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default";

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      {/* Materials */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Materials still needed:</div>
        {statuses.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing more needed.</p>
        ) : (
          <div className="space-y-1">
            {statuses.map((status) => (
              <div
                key={status.item}
                className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded text-sm ${
                  status.shortage === 0 ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <ItemWithTooltip itemId={status.item} locale={locale} />
                <div className="font-mono text-xs text-gray-600">
                  {formatNumber(status.have)} / {formatNumber(status.need)}
                  {status.shortage > 0 ? (
                    <span className="ml-2 text-red-600 font-bold">short {formatNumber(status.shortage)}</span>
                  ) : (
                    <span className="ml-2 text-green-600 font-bold">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Steps:</div>
          <div className="space-y-2">
            {steps.map(({ recipe, done, remaining, usefulRuns, craftableNow }, stepIndex) => {
              const isDone = remaining === 0;
              const notNeeded = !isDone && usefulRuns === 0;
              return (
                <div
                  key={stepKeys[stepIndex]}
                  className={`border border-gray-200 rounded p-2 ${isDone ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <div className="text-sm text-gray-800">{formatRecipe(recipe, locale)}</div>
                  <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
                    <div className="text-xs text-gray-600">
                      {formatDuration(recipe.duration)} each · done{" "}
                      <span className="font-mono">
                        {formatNumber(done)} / {formatNumber(recipe.count)}
                      </span>
                      {craftableNow > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                          can run {formatNumber(craftableNow)} now
                        </span>
                      )}
                      {notNeeded && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-medium">
                          not needed (covered by inventory)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Undo one run"
                        disabled={done === 0}
                        onClick={() => onRecordStepRuns(entry.id, stepIndex, -1)}
                        className={stepButtonClass}
                      >
                        −1
                      </button>
                      <button
                        type="button"
                        aria-label="Record one run"
                        disabled={isDone}
                        onClick={() => onRecordStepRuns(entry.id, stepIndex, 1)}
                        className={stepButtonClass}
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductionPlanList({
  plan,
  onRemoveItem,
  onToggleCompletion,
  onRecordStepRuns,
  locale = "en",
}: ProductionPlanListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (entryId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  if (plan.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Production Plan</h2>
        <p className="text-gray-500 text-sm">No entries in the plan yet. Add items or upgrades from the list.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Production Plan</h2>
      <div className="space-y-3">
        {plan.items.map((entry) => {
          const { steps, materials: statuses } = analyzeEntry(entry, plan.inventory);
          const shortCount = statuses.filter((status) => status.shortage > 0).length;
          const covered = isMaterialsCovered(statuses);
          const doneSteps = steps.filter((step) => step.remaining === 0).length;
          const isExpanded = expandedItems.has(entry.id);
          const ready = isReadyToFinish(entry, plan.inventory);
          const cardClass = entry.completed
            ? "bg-gray-50 border-gray-300 opacity-60"
            : ready
              ? "bg-green-50 border-green-500 ring-2 ring-green-300"
              : "bg-white border-gray-200";

          return (
            <div key={entry.id} className={`border rounded-lg p-4 ${cardClass}`}>
              {ready && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded bg-green-600 text-white text-sm font-bold">
                  <span aria-hidden="true">🚀</span>
                  {entry.kind === "upgrade"
                    ? "Ready! You have everything for this upgrade. Go build it!"
                    : "Ready! You can craft all of this right now."}
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={entry.completed}
                    aria-label="Completed"
                    onChange={() => {
                      onToggleCompletion(entry.id);
                      // 完了時にdetailsを閉じる
                      if (!entry.completed && expandedItems.has(entry.id)) {
                        toggleExpand(entry.id);
                      }
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <EntryTitle entry={entry} inventory={plan.inventory} locale={locale} />
                    <div className="text-sm mt-1">
                      <span className={covered ? "text-green-700" : "text-gray-600"}>
                        Materials: {covered ? "covered" : `short (${shortCount} item${shortCount === 1 ? "" : "s"})`}
                      </span>
                      {steps.length > 0 && (
                        <span className="text-gray-600 ml-3">
                          Steps: {doneSteps}/{steps.length} done
                        </span>
                      )}
                    </div>
                    {entry.kind === "item" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Pattern {entry.selectedPatternIndex + 1} (
                        {formatDuration(entry.calculationResults[entry.selectedPatternIndex].totalDuration)})
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(entry.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {isExpanded && (
                <EntryDetails
                  entry={entry}
                  inventory={plan.inventory}
                  onRecordStepRuns={onRecordStepRuns}
                  locale={locale}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
