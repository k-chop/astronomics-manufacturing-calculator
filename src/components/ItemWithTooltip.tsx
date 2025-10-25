import { getAliasItems } from "../data/aliases";
import { getItemName } from "../data/item-names";

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
  const hasTooltip = aliasItems !== undefined;

  const underlineClass =
    hasTooltip || alwaysShowUnderline
      ? "cursor-help border-b border-dotted border-gray-400"
      : "";

  return (
    <span className="relative group">
      <span className={`${className} ${underlineClass}`}>
        {getItemName(itemId, locale)}
      </span>
      {hasTooltip && (
        <span className="invisible group-hover:visible absolute left-0 top-full mt-1 w-max max-w-md bg-gray-800 text-white text-xs rounded px-3 py-2 z-10 shadow-lg">
          {aliasItems.map((aliasItem) => getItemName(aliasItem, locale)).join(", ")}
        </span>
      )}
    </span>
  );
}
