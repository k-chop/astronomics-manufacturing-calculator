import { itemNames, type Locale, type LocalizedNames } from "../data/item-names";
import { isRawMaterial } from "../data/raw-materials";
import { recipes } from "../data/recipes";

export type ItemSearchResult = {
  id: string;
  name: string;
  hasRecipe: boolean; // 製造レシピを持つ（作れる）
  isRaw: boolean; // 原材料として採取できる
};

function getLocalizedName(names: LocalizedNames, locale: Locale): string {
  return names[locale] || names.en;
}

/**
 * IDと表示名の両方でマッチングして検索する
 * レシピ持ち（作れるもの）を先に、その中は itemNames の定義順で返す
 */
export function searchItems(query: string, locale: Locale = "en"): ItemSearchResult[] {
  const lowerQuery = query.toLowerCase();
  return Object.entries(itemNames)
    .filter(([id, names]) => {
      const name = getLocalizedName(names, locale);
      return id.toLowerCase().includes(lowerQuery) || name.toLowerCase().includes(lowerQuery);
    })
    .map(([id, names]) => ({
      id,
      name: getLocalizedName(names, locale),
      hasRecipe: id in recipes,
      isRaw: isRawMaterial(id),
    }))
    .toSorted((a, b) => Number(b.hasRecipe) - Number(a.hasRecipe));
}
