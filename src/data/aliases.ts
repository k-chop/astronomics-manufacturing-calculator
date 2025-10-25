/**
 * Aliases represent a group of interchangeable items.
 * When used in recipes, any item from the list can be used.
 */
export type AliasMap = {
  [aliasId: string]: string[];
};

export const aliases: AliasMap = {
  "any-gem": [
    "ruby",
    "cracked-ruby",
    "sapphire",
    "cracked-sapphire",
    "emerald",
    "cracked-emerald",
    "topaz",
    "cracked-topaz",
    "aquamarine",
    "cracked-aquamarine",
    "opal",
    "cracked-opal",
    "citrine",
    "cracked-citrine",
    "diamond",
  ],
};

/**
 * Get the list of item IDs that belong to an alias.
 * Returns undefined if the item is not an alias.
 */
export function getAliasItems(itemId: string): string[] | undefined {
  return aliases[itemId];
}
