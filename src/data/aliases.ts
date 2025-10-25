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
    "sapphire",
    "emerald",
    "topaz",
    "aquamarine",
    "opal",
    "citrine",
    "cracked-ruby",
    "cracked-sapphire",
    "cracked-emerald",
    "cracked-topaz",
    "cracked-aquamarine",
    "cracked-opal",
    "cracked-citrine",
  ],
};

/**
 * Get the list of item IDs that belong to an alias.
 * Returns undefined if the item is not an alias.
 */
export function getAliasItems(itemId: string): string[] | undefined {
  return aliases[itemId];
}
