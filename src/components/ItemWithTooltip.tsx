import { getAliasItems } from "../data/aliases";
import { getAsteroidName } from "../data/asteroid-names";
import { getItemName } from "../data/item-names";
import { rawMaterials } from "../data/raw-materials";
import { RawMaterialIcon } from "./RawMaterialIcon";

type ItemWithTooltipProps = {
  itemId: string;
  locale?: string;
  className?: string;
  alwaysShowUnderline?: boolean;
};

export function ItemWithTooltip({
  itemId,
  locale = "en",
  className = "",
  alwaysShowUnderline = false,
}: ItemWithTooltipProps) {
  const aliasItems = getAliasItems(itemId);
  const rawMaterial = rawMaterials[itemId];
  const hasAliasTooltip = aliasItems !== undefined;
  const hasRawMaterialTooltip = rawMaterial !== undefined;
  const hasTooltip = hasAliasTooltip || hasRawMaterialTooltip;
  const showFoundOn = hasRawMaterialTooltip && rawMaterial.foundOn.length !== 0;

  const underlineClass =
    hasTooltip || alwaysShowUnderline
      ? "cursor-help border-b border-dotted border-gray-400"
      : "";

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
        <span className="invisible group-hover:visible absolute left-0 top-full mt-1 w-max max-w-md bg-gray-800 text-white text-xs rounded px-3 py-2 z-10 shadow-lg">
          {hasAliasTooltip && (
            <div className="mb-2">
              <div className="font-semibold mb-1">Can use any of:</div>
              {aliasItems.map((aliasItem) => getItemName(aliasItem, locale)).join(", ")}
            </div>
          )}
          {showFoundOn && (
            <div>
              <div className="font-semibold mb-1">Found on:</div>
              {rawMaterial.foundOn.map((asteroid) => getAsteroidName(asteroid, locale)).join(", ")}
            </div>
          )}
        </span>
      )}
    </span>
  );
}
