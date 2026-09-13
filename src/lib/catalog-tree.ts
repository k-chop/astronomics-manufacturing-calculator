import { aliases } from "../data/aliases";
import { getItemName, type Locale } from "../data/item-names";
import { getMachineName, machineNames } from "../data/machines";
import {
  getRawMaterialCategoryName,
  isRawMaterial,
  type RawMaterialCategory,
  rawMaterialCategoryNames,
  rawMaterials,
} from "../data/raw-materials";
import { recipes } from "../data/recipes";
import {
  getUpgradeCategoryName,
  getUpgradeName,
  type UpgradeCategory,
  upgradeCategoryNames,
  upgrades,
} from "../data/upgrades";

/**
 * 中央ペインに表示する対象
 */
export type Selection = { kind: "item"; itemId: string } | { kind: "upgrade"; upgradeId: string; level: number };

export type TreeLeaf = {
  kind: "leaf";
  id: string;
  label: string;
  selection: Selection;
  isRaw: boolean;
};

export type TreeBranch = {
  kind: "branch";
  id: string;
  label: string;
  children: TreeNode[];
};

export type TreeNode = TreeBranch | TreeLeaf;

export function getSelectionId(selection: Selection): string {
  return selection.kind === "item" ? `item:${selection.itemId}` : `upgrade:${selection.upgradeId}:${selection.level}`;
}

function itemLeaf(itemId: string, locale: Locale): TreeLeaf {
  const selection: Selection = { kind: "item", itemId };
  return {
    kind: "leaf",
    id: getSelectionId(selection),
    label: getItemName(itemId, locale),
    selection,
    isRaw: isRawMaterial(itemId),
  };
}

function buildRawMaterialBranch(locale: Locale): TreeBranch {
  const categories = Object.keys(rawMaterialCategoryNames) as RawMaterialCategory[];
  const materials = Object.values(rawMaterials).filter((material) => !(material.id in aliases));

  return {
    kind: "branch",
    id: "items/raw",
    label: "Raw Materials",
    children: categories.map((category) => ({
      kind: "branch",
      id: `items/raw/${category}`,
      label: getRawMaterialCategoryName(category, locale),
      children: materials
        .filter((material) => material.category === category)
        .map((material) => itemLeaf(material.id, locale)),
    })),
  };
}

function buildManufacturedBranch(locale: Locale): TreeBranch {
  return {
    kind: "branch",
    id: "items/manufactured",
    label: "Manufactured",
    children: Object.keys(machineNames).map((machineId) => ({
      kind: "branch",
      id: `items/manufactured/${machineId}`,
      label: getMachineName(machineId, locale),
      children: Object.entries(recipes)
        .filter(([, methods]) => methods.some((method) => method.machine === machineId))
        .map(([itemId]) => itemLeaf(itemId, locale)),
    })),
  };
}

function buildUpgradesBranch(locale: Locale): TreeBranch {
  const categories = Object.keys(upgradeCategoryNames) as UpgradeCategory[];

  return {
    kind: "branch",
    id: "upgrades",
    label: "Upgrades",
    children: categories.map((category) => ({
      kind: "branch",
      id: `upgrades/${category}`,
      label: getUpgradeCategoryName(category, locale),
      children: upgrades
        .filter((upgrade) => upgrade.category === category)
        .map((upgrade) => ({
          kind: "branch",
          id: `upgrades/${category}/${upgrade.id}`,
          label: getUpgradeName(upgrade.id, locale),
          children: upgrade.levels.map((upgradeLevel) => {
            const selection: Selection = { kind: "upgrade", upgradeId: upgrade.id, level: upgradeLevel.level };
            return {
              kind: "leaf",
              id: getSelectionId(selection),
              label: `Lv${upgradeLevel.level}`,
              selection,
              isRaw: false,
            };
          }),
        })),
    })),
  };
}

/**
 * 左ペインに表示するカタログツリーを構築する
 */
export function buildCatalogTree(locale: Locale = "en"): TreeBranch[] {
  return [
    {
      kind: "branch",
      id: "items",
      label: "Items",
      children: [buildRawMaterialBranch(locale), buildManufacturedBranch(locale)],
    },
    buildUpgradesBranch(locale),
  ];
}

function leafMatches(leaf: TreeLeaf, lowerQuery: string): boolean {
  if (leaf.label.toLowerCase().includes(lowerQuery)) return true;
  const { selection } = leaf;
  return selection.kind === "item" ? selection.itemId.includes(lowerQuery) : selection.upgradeId.includes(lowerQuery);
}

function filterNodes(nodes: TreeNode[], lowerQuery: string, parentMatches: boolean): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    if (node.kind === "leaf") {
      if (parentMatches || leafMatches(node, lowerQuery)) result.push(node);
      continue;
    }
    // アップグレード名など branch のラベルがマッチした場合はその配下をすべて残す
    const branchMatches = parentMatches || node.label.toLowerCase().includes(lowerQuery);
    const children = filterNodes(node.children, lowerQuery, branchMatches);
    if (children.length > 0) result.push({ ...node, children });
  }
  return result;
}

/**
 * query にマッチする葉だけを残したツリーを返す（空になった branch は落とす）
 * branch のラベル自体がマッチした場合はその配下をすべて残す
 */
export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const lowerQuery = query.trim().toLowerCase();
  if (lowerQuery === "") return nodes;
  return filterNodes(nodes, lowerQuery, false);
}
