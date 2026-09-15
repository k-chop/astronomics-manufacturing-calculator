import { getItemName, type Locale } from "../data/item-names";
import { getRawMaterialCategoryName, rawMaterials } from "../data/raw-materials";
import { FoundOnList } from "./FoundOnList";
import { RawMaterialIcon } from "./RawMaterialIcon";

type RawMaterialSourceProps = {
  itemId: string;
  locale?: Locale;
};

/**
 * Shows where a raw material can be collected. Renders nothing if the item is not a raw material.
 */
export function RawMaterialSource({ itemId, locale = "en" }: RawMaterialSourceProps) {
  const rawMaterial = rawMaterials[itemId];
  if (rawMaterial === undefined) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-semibold flex items-center">
          {getItemName(itemId, locale)}
          <span className="text-green-600">
            <RawMaterialIcon />
          </span>
        </div>
        <div className="text-base text-gray-600">{getRawMaterialCategoryName(rawMaterial.category, locale)}</div>
      </div>
      {rawMaterial.foundOn.length === 0 ? (
        <p className="text-base text-gray-500">No collection location is recorded for this item.</p>
      ) : (
        <div>
          <div className="font-semibold mb-2">Found on:</div>
          <div className="text-base text-gray-700">
            <FoundOnList foundOn={rawMaterial.foundOn} locale={locale} mutedClassName="text-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
}
