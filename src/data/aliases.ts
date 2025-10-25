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
 * Check if an item ID is an alias
 */
export function isAlias(itemId: string): boolean {
  return itemId in aliases;
}

/**
 * Get the list of items for an alias, or the item itself if not an alias
 */
export function resolveAlias(itemId: string): string[] {
  return aliases[itemId] ?? [itemId];
}

/**
 * Get a representative item for an alias (first item in the list)
 */
export function getRepresentative(itemId: string): string {
  if (isAlias(itemId)) {
    return aliases[itemId][0];
  }
  return itemId;
}

/**
 * Get the alias ID for a given item, if it belongs to an alias group.
 * Returns the alias ID if found, otherwise returns the item itself.
 */
export function getAliasForItem(itemId: string): string {
  for (const [aliasId, items] of Object.entries(aliases)) {
    if (items.includes(itemId)) {
      return aliasId;
    }
  }
  return itemId;
}

/**
 * Get the list of item IDs that belong to an alias.
 * Returns undefined if the item is not an alias.
 */
export function getAliasItems(itemId: string): string[] | undefined {
  return aliases[itemId];
}
