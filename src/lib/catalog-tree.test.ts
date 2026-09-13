import { describe, expect, it } from "vitest";

import { aliases } from "../data/aliases";
import { itemNames } from "../data/item-names";
import { upgrades } from "../data/upgrades";
import { buildCatalogTree, filterTree, getSelectionId, type TreeLeaf, type TreeNode } from "./catalog-tree";

function collectLeaves(nodes: TreeNode[], path: string[] = []): Array<{ leaf: TreeLeaf; path: string[] }> {
  return nodes.flatMap((node) =>
    node.kind === "leaf" ? [{ leaf: node, path }] : collectLeaves(node.children, [...path, node.id]),
  );
}

function collectBranchIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => (node.kind === "branch" ? [node.id, ...collectBranchIds(node.children)] : []));
}

describe("buildCatalogTree", () => {
  const tree = buildCatalogTree();
  const leaves = collectLeaves(tree);

  it("ルートは Items と Upgrades", () => {
    expect(tree.map((node) => node.label)).toEqual(["Items", "Upgrades"]);
  });

  it("エイリアス以外の全アイテムが葉として現れる", () => {
    const leafIds = new Set(leaves.map(({ leaf }) => leaf.id));
    const itemIds = Object.keys(itemNames).filter((itemId) => !(itemId in aliases));
    for (const itemId of itemIds) {
      expect(leafIds.has(`item:${itemId}`), `${itemId} がツリーにない`).toBe(true);
    }
  });

  it("エイリアスは葉として現れない", () => {
    const leafIds = new Set(leaves.map(({ leaf }) => leaf.id));
    for (const aliasId of Object.keys(aliases)) {
      expect(leafIds.has(`item:${aliasId}`), `${aliasId} はツリーに出ない`).toBe(false);
    }
  });

  it("全アップグレードの全レベルが葉として現れる", () => {
    const leafIds = new Set(leaves.map(({ leaf }) => leaf.id));
    for (const upgrade of upgrades) {
      for (const upgradeLevel of upgrade.levels) {
        const id = getSelectionId({ kind: "upgrade", upgradeId: upgrade.id, level: upgradeLevel.level });
        expect(leafIds.has(id), `${id} がツリーにない`).toBe(true);
      }
    }
  });

  it("原材料かつレシピ持ちのアイテムは両方の分類に現れる", () => {
    const carbonPaths = leaves.filter(({ leaf }) => leaf.id === "item:carbon").map(({ path }) => path.at(-1));
    expect(carbonPaths).toEqual(["items/raw/surface", "items/manufactured/carbonator"]);

    const polymerPaths = leaves.filter(({ leaf }) => leaf.id === "item:polymers").map(({ path }) => path.at(-1));
    expect(polymerPaths).toEqual(["items/manufactured/carbonator", "items/manufactured/clarifier"]);
  });

  it("葉に原材料フラグが付く", () => {
    const byId = new Map(leaves.map(({ leaf }) => [leaf.id, leaf]));
    expect(byId.get("item:copper")?.isRaw).toBe(true);
    expect(byId.get("item:copper-wire")?.isRaw).toBe(false);
    expect(byId.get("upgrade:fuel-capacity:1")?.label).toBe("Lv1");
  });
});

describe("filterTree", () => {
  const tree = buildCatalogTree();

  it("空の query は元のツリーを返す", () => {
    expect(filterTree(tree, "")).toBe(tree);
    expect(filterTree(tree, "   ")).toBe(tree);
  });

  it("マッチする葉だけを残し、空になった branch を落とす", () => {
    const filtered = filterTree(tree, "cop");
    const leafIds = collectLeaves(filtered).map(({ leaf }) => leaf.id);
    const branchIds = collectBranchIds(filtered);

    expect(leafIds).toEqual(["item:copper", "item:copper-wire"]);
    expect(branchIds).toEqual([
      "items",
      "items/raw",
      "items/raw/minerals",
      "items/manufactured",
      "items/manufactured/converter",
    ]);
  });

  it("大文字小文字を無視し、id でもマッチする", () => {
    expect(collectLeaves(filterTree(tree, "GYPSUM")).map(({ leaf }) => leaf.id)).toEqual(["item:gypsum"]);
    // 表示名は "Fiber Optic Strands" なので id 側でマッチする
    expect(collectLeaves(filterTree(tree, "fiber-optic")).map(({ leaf }) => leaf.id)).toEqual([
      "item:fiber-optic-strands",
    ]);
  });

  it("upgrade はアップグレード名でマッチし、全 Lv が残る", () => {
    const filtered = filterTree(tree, "fuel capacity");
    const leafIds = collectLeaves(filtered).map(({ leaf }) => leaf.id);
    expect(leafIds).toEqual(["upgrade:fuel-capacity:1", "upgrade:fuel-capacity:2", "upgrade:fuel-capacity:3"]);
  });

  it("空白区切りは AND 検索で、語順は問わない", () => {
    expect(collectLeaves(filterTree(tree, "upgrade manufactur")).map(({ leaf }) => leaf.id)).toEqual([
      "upgrade:manufacturing:1",
      "upgrade:manufacturing:2",
      "upgrade:manufacturing:3",
    ]);
    expect(collectLeaves(filterTree(tree, "  lv3   fuel ")).map(({ leaf }) => leaf.id)).toEqual([
      "upgrade:fuel-capacity:3",
    ]);
  });

  it("カテゴリや機械名などの branch ラベルは検索対象にしない", () => {
    // "Manufactured" branch 配下のアイテムはヒットせず、Manufacturing upgrade だけが残る
    expect(collectLeaves(filterTree(tree, "manufactur")).map(({ leaf }) => leaf.id)).toEqual([
      "upgrade:manufacturing:1",
      "upgrade:manufacturing:2",
      "upgrade:manufacturing:3",
    ]);
    expect(filterTree(tree, "carbonator")).toEqual([]);
  });

  it("何もマッチしなければ空配列", () => {
    expect(filterTree(tree, "zzz-not-exist")).toEqual([]);
  });
});
