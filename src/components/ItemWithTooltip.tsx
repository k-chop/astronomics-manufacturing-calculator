import type { ReactNode } from "react";

import { getAliasItems } from "../data/aliases";
import { getItemName, type Locale } from "../data/item-names";
import { rawMaterials } from "../data/raw-materials";
import { FoundOnList } from "./FoundOnList";
import { RawMaterialIcon } from "./RawMaterialIcon";

type ItemWithTooltipProps = {
  itemId: string;
  locale?: Locale;
  className?: string;
  alwaysShowUnderline?: boolean;
  children?: ReactNode; // ポップアップの末尾に追記する内容
};

/**
 * ポップアップ内のセクション見出し（パネルの列見出しや Collect / Craft の区分と同じ書式）
 */
export function TooltipHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-base font-semibold uppercase tracking-wide text-gray-600 mb-2 pb-1 border-b border-gray-200">
      {children}
    </div>
  );
}

export function ItemWithTooltip({
  itemId,
  locale = "en",
  className = "",
  alwaysShowUnderline = false,
  children,
}: ItemWithTooltipProps) {
  const aliasItems = getAliasItems(itemId);
  const rawMaterial = rawMaterials[itemId];
  const hasAliasTooltip = aliasItems !== undefined;
  const hasRawMaterialTooltip = rawMaterial !== undefined;
  const hasTooltip = hasAliasTooltip || hasRawMaterialTooltip || children !== undefined;
  const showFoundOn = hasRawMaterialTooltip && rawMaterial.foundOn.length !== 0;

  const underlineClass = hasTooltip || alwaysShowUnderline ? "cursor-help border-b border-dotted border-gray-400" : "";

  return (
    <span className="relative group">
      <span className={`${className} ${underlineClass}`}>
        {getItemName(itemId, locale)}
        {hasRawMaterialTooltip && (
          <span className="text-green-600">
            <RawMaterialIcon />
          </span>
        )}
      </span>
      {hasTooltip && (
        <span className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition duration-100 ease-out motion-reduce:transition-none absolute left-0 top-full mt-1 w-max max-w-md bg-white text-gray-800 text-base font-normal rounded px-4 py-3 z-10 border border-gray-300 shadow-lg">
          {hasAliasTooltip && (
            <div className="mb-4">
              <TooltipHeading>Can use any of</TooltipHeading>
              {aliasItems.map((aliasItem) => getItemName(aliasItem, locale)).join(", ")}
            </div>
          )}
          {showFoundOn && (
            <div className={children === undefined ? "" : "mb-4"}>
              <TooltipHeading>Found on</TooltipHeading>
              <FoundOnList foundOn={rawMaterial.foundOn} locale={locale} mutedClassName="text-gray-500" />
            </div>
          )}
          {children}
        </span>
      )}
    </span>
  );
}
