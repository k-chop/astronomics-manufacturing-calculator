import { type ReactNode, useState } from "react";

import { getItemName, type Locale } from "../data/item-names";
import { getMachineName } from "../data/machines";
import type { ItemStack } from "../data/recipes";
import { type CollectionRoute as CollectionRouteData, hasCollectionRoute } from "../lib/collection-route";
import { formatNumber } from "../lib/format-utils";
import { getEntryTitle } from "../lib/plan-format";
import {
  getRelatedRows,
  type InventoryRow,
  isRowSatisfied,
  type ItemRelations,
  type ReadyCraft,
  type RelationKind,
  type StepUse,
} from "../lib/production-plan-utils";
import { formatItemStacks } from "../lib/recipe-format";
import { CollectionRoute } from "./CollectionRoute";
import { ItemWithTooltip, TooltipHeading } from "./ItemWithTooltip";

type InventoryPanelProps = {
  rows: InventoryRow[];
  craftsByOutput: Map<string, ReadyCraft[]>; // 出力アイテム id → 今実行できる製造ステップ
  relations: Map<string, ItemRelations>; // アイテム id → 何から作る／何に使う
  collectionRoute: CollectionRouteData; // 集めるもののうち足りないものを、どの順に回れば揃うかにしたもの
  onUpdateInventory: (itemId: string, amount: number) => void;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale?: Locale;
};

// Have 列の入力欄と同じ上下パディング・枠線幅を持たせて、他の列の文字の高さを入力欄の文字に揃える
const cellTextClass = "py-1 border border-transparent";

const runButtonClass =
  "px-2 py-0.5 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap";

// 乗せている行の材料になる行は amber、乗せている行から作られる行は sky（パネル背景が blue-50 系なので薄い青は避ける）
const relatedRowClass: { [kind in RelationKind]: string } = {
  material: "bg-amber-100",
  product: "bg-sky-200",
};

function getRowClass(item: string, hoveredItem: string | null, relatedKind: RelationKind | undefined): string {
  if (item === hoveredItem) return "bg-white/70";
  return relatedKind === undefined ? "" : relatedRowClass[relatedKind];
}

const relationBadgeClass: { [kind in RelationKind]: string } = {
  material: "bg-amber-200 text-amber-900",
  product: "bg-sky-300 text-sky-900",
};

/**
 * 乗せている行との関係を示すバッジ（"material for Carbon" / "made from Carbon"）
 */
function RelationBadge({ kind, hoveredItem, locale }: { kind: RelationKind; hoveredItem: string; locale: Locale }) {
  const label = kind === "material" ? "material for" : "made from";
  return (
    <span className={`ml-2 px-1.5 py-0.5 rounded text-sm font-medium whitespace-nowrap ${relationBadgeClass[kind]}`}>
      {label} {getItemName(hoveredItem, locale)}
    </span>
  );
}

/**
 * ツリーの 1 行分。ポップアップを出しているアイテム自身なら薄い背景で強調する
 */
function TreeItem({ stack, item, locale }: { stack: ItemStack; item: string; locale: Locale }) {
  return (
    <span className={stack.item === item ? "bg-amber-100 rounded px-1" : "px-1"}>
      {formatItemStacks([stack], locale)}
    </span>
  );
}

/**
 * レシピをツリーで表示する（完成品を親、材料を子、最後に機械名とエントリ名）
 */
function RecipeTree({ uses, item, locale }: { uses: StepUse[]; item: string; locale: Locale }) {
  return uses.map(({ entry, stepIndex, recipe }) => (
    <div key={`${entry.id}:${stepIndex}`}>
      {recipe.outputs.map((output) => (
        <div key={output.item}>
          <TreeItem stack={output} item={item} locale={locale} />
          <span className="text-sm text-gray-500">with {getMachineName(recipe.machine, locale)}</span>
        </div>
      ))}
      {recipe.inputs.map((input, index) => (
        <div key={input.item} className="flex items-baseline gap-1 pl-4">
          <span className="font-mono text-gray-500">{index === recipe.inputs.length - 1 ? "└─" : "├─"}</span>
          <TreeItem stack={input} item={item} locale={locale} />
        </div>
      ))}
      <div className="text-sm text-gray-500 px-1">for {getEntryTitle(entry, locale)}</div>
    </div>
  ));
}

function hasRelations(relations: ItemRelations | undefined): relations is ItemRelations {
  return (
    relations !== undefined &&
    (relations.madeBy.length > 0 || relations.usedIn.length > 0 || relations.usedFor.length > 0)
  );
}

/**
 * ポップアップに出す「何から作る／何に使う」
 */
function RelationsTooltip({ item, relations, locale }: { item: string; relations: ItemRelations; locale: Locale }) {
  const { madeBy, usedIn, usedFor } = relations;
  const hasMadeBy = madeBy.length > 0;
  const hasUsedFor = usedIn.length > 0 || usedFor.length > 0;

  return (
    <>
      {hasMadeBy && (
        <div className={hasUsedFor ? "mb-4" : ""}>
          <TooltipHeading>Made from</TooltipHeading>
          <div className="space-y-2">
            <RecipeTree uses={madeBy} item={item} locale={locale} />
          </div>
        </div>
      )}
      {hasUsedFor && (
        <div>
          <TooltipHeading>Used for</TooltipHeading>
          <div className="space-y-2">
            <RecipeTree uses={usedIn} item={item} locale={locale} />
            {usedFor.map(({ entry, amount }) => (
              <div key={entry.id}>
                {getEntryTitle(entry, locale)}
                {entry.kind === "upgrade" && <span className="text-gray-500"> ×{formatNumber(amount)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

type InventoryRowViewProps = {
  row: InventoryRow;
  crafts: ReadyCraft[]; // この行のアイテムを出力する、今実行できる製造ステップ
  relationsTooltip: ReactNode | undefined;
  hoveredItem: string | null;
  relatedKind: RelationKind | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onUpdateInventory: (itemId: string, amount: number) => void;
  onRecordStepRuns: (entryId: string, stepIndex: number, delta: number) => void;
  locale: Locale;
};

/**
 * 在庫パネルの 1 行（アイテム名・実行できるステップ・必要数・在庫・不足）。在庫が必要数に達した行は薄く出す
 * 集めるものの不足数字は乗せると「Collected」に変わり、押すと Have を Required にする
 */
function InventoryRowView({
  row,
  crafts,
  relationsTooltip,
  hoveredItem,
  relatedKind,
  onMouseEnter,
  onMouseLeave,
  onUpdateInventory,
  onRecordStepRuns,
  locale,
}: InventoryRowViewProps) {
  // 行全体に掛けるとポップアップまで薄くなるので、各セルの中身にだけ掛ける
  const mutedClass = isRowSatisfied(row) ? "opacity-60" : "";
  return (
    <tr
      className={`border-t border-blue-100 align-top ${getRowClass(row.item, hoveredItem, relatedKind)}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <td className="py-1.5 pr-2 break-words">
        <div className={cellTextClass}>
          <ItemWithTooltip itemId={row.item} locale={locale} className={`font-medium text-gray-700 ${mutedClass}`}>
            {relationsTooltip}
          </ItemWithTooltip>
          {hoveredItem !== null && relatedKind !== undefined && (
            <RelationBadge kind={relatedKind} hoveredItem={hoveredItem} locale={locale} />
          )}
        </div>
        {crafts.length > 0 && (
          <div className={`space-y-1 mt-1 ${mutedClass}`}>
            {crafts.map((craft) => (
              <div
                key={`${craft.entry.id}:${craft.stepIndex}`}
                className="flex items-center gap-2 flex-wrap text-sm"
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
        <div className={`${cellTextClass} ${mutedClass}`}>{formatNumber(row.required)}</div>
      </td>
      <td className="py-1.5 px-1 text-right">
        <input
          type="number"
          min="0"
          value={row.have}
          aria-label={`Have ${row.item}`}
          onChange={(e) => onUpdateInventory(row.item, Number(e.target.value))}
          className={`w-full px-1.5 py-1 text-base text-right font-mono border border-gray-300 rounded bg-white ${mutedClass}`}
        />
      </td>
      <td className="group py-1.5 px-1 text-right font-mono font-bold whitespace-nowrap">
        <div className={`${cellTextClass} ${mutedClass}`}>
          {row.missing > 0 && !row.crafted ? (
            // 乗せると「Collected」に変わり、押すと Have を Required にする
            <button
              type="button"
              onClick={() => onUpdateInventory(row.item, row.required)}
              className="text-red-600 cursor-pointer"
              title="Mark as collected (set Have to Required)"
            >
              <span className="group-hover:hidden">{formatNumber(row.missing)}</span>
              <span className="hidden group-hover:inline font-sans font-medium text-sm text-green-700">Collected</span>
            </button>
          ) : row.missing > 0 ? (
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
  );
}

/**
 * Collect / Craft の区分見出し行
 */
function GroupHeading({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={4} className="pt-3 pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </td>
    </tr>
  );
}

export function InventoryPanel({
  rows,
  craftsByOutput,
  relations,
  collectionRoute,
  onUpdateInventory,
  onRecordStepRuns,
  locale = "en",
}: InventoryPanelProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (rows.length === 0) {
    return null;
  }

  const related = hoveredItem === null ? new Map<string, RelationKind>() : getRelatedRows(relations, hoveredItem);
  // 集めるもの → 作るもの の順に並んでいるので、区分ごとに見出しを付けて描画する
  const collectRows = rows.filter((row) => !row.crafted);
  const craftRows = rows.filter((row) => row.crafted);

  const renderRow = (row: InventoryRow) => {
    const rowRelations = relations.get(row.item);
    return (
      <InventoryRowView
        key={row.item}
        row={row}
        crafts={craftsByOutput.get(row.item) ?? []}
        // 関係が無い行には渡さない（渡すとポップアップと下線が出てしまう）
        relationsTooltip={
          hasRelations(rowRelations) ? (
            <RelationsTooltip item={row.item} relations={rowRelations} locale={locale} />
          ) : undefined
        }
        hoveredItem={hoveredItem}
        relatedKind={related.get(row.item)}
        onMouseEnter={() => setHoveredItem(row.item)}
        onMouseLeave={() => setHoveredItem((current) => (current === row.item ? null : current))}
        onUpdateInventory={onUpdateInventory}
        onRecordStepRuns={onRecordStepRuns}
        locale={locale}
      />
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
      <h2 className="text-2xl font-bold mb-1 text-gray-900">Materials &amp; Inventory</h2>
      <p className="text-base text-gray-600 mb-4">
        Enter what you have. Required is the total for all incomplete entries in your plan, including intermediates your
        remaining steps will craft.
      </p>
      <table className="w-full table-fixed text-base">
        <colgroup>
          <col />
          <col className="w-20" />
          <col className="w-24" />
          <col className="w-20" />
        </colgroup>
        <thead>
          <tr className="text-left text-sm text-gray-500 uppercase tracking-wide">
            <th className="py-1 pr-2 font-medium">Item</th>
            <th className="py-1 px-1 font-medium text-right">Required</th>
            <th className="py-1 px-1 font-medium text-right">Have</th>
            <th className="py-1 px-1 font-medium text-right">Missing</th>
          </tr>
        </thead>
        <tbody>
          {collectRows.length > 0 && (
            <>
              <GroupHeading label="Collect" />
              {collectRows.map(renderRow)}
              {hasCollectionRoute(collectionRoute) && (
                <tr className="border-t border-blue-100">
                  <td colSpan={4} className="pt-3 pb-1">
                    <CollectionRoute route={collectionRoute} locale={locale} />
                  </td>
                </tr>
              )}
            </>
          )}
          {craftRows.length > 0 && (
            <>
              <GroupHeading label="Craft" />
              {craftRows.map(renderRow)}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
