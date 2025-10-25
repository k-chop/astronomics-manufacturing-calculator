import { getAliasItems } from "../data/aliases";
import { getAsteroidInfo } from "../data/asteroid";
import { getItemName, type Locale } from "../data/item-names";
import { rawMaterials } from "../data/raw-materials";
import { RawMaterialIcon } from "./RawMaterialIcon";

type ItemWithTooltipProps = {
  itemId: string;
  locale?: Locale;
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
        <span className="invisible group-hover:visible absolute left-0 top-full mt-1 w-max bg-gray-800 text-white text-xs rounded px-3 py-2 z-10 shadow-lg">
          {hasAliasTooltip && (
            <div className="mb-2">
              <div className="font-semibold mb-1">Can use any of:</div>
              {aliasItems.map((aliasItem) => getItemName(aliasItem, locale)).join(", ")}
            </div>
          )}
          {showFoundOn && (
            <div>
              <div className="font-semibold mb-1">Found on:</div>
              <div className="space-y-0.5">
                {rawMaterial.foundOn.map((asteroid) => {
                  const info = getAsteroidInfo(asteroid, locale);
                  if (info.region && info.compositon) {
                    return (
                      <div key={asteroid} className="flex gap-2 whitespace-nowrap">
                        <span className="font-mono inline-block w-9 text-right">{info.name}</span>
                        <span>-</span>
                        <span className="inline-block min-w-32">{info.region}</span>
                        <span className="text-gray-400">({info.compositon})</span>
                      </div>
                    );
                  } else {
                    return <div key={asteroid}>{info.name}</div>;
                  }
                })}
              </div>
            </div>
          )}
        </span>
      )}
    </span>
  );
}
