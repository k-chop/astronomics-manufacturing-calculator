import { describe, expect, it } from "vitest";

import { aliases } from "./aliases";
import { itemNames } from "./item-names";
import { rawMaterials } from "./raw-materials";
import { recipes } from "./recipes";
import { upgrades } from "./upgrades";

describe("データ整合性", () => {
  it("レシピが参照するアイテムはすべて表示名を持ち、原材料かレシピ持ちのどちらかである", () => {
    for (const [itemId, methods] of Object.entries(recipes)) {
      expect(itemNames, `${itemId} の表示名がない`).toHaveProperty(itemId);
      for (const method of methods) {
        for (const input of method.inputs) {
          expect(itemNames, `${itemId} の材料 ${input.item} の表示名がない`).toHaveProperty(input.item);
          expect(
            input.item in rawMaterials || input.item in recipes,
            `${itemId} の材料 ${input.item} が原材料でもレシピ持ちでもない`,
          ).toBe(true);
        }
      }
    }
  });

  it("原材料はすべて表示名を持ち、id がキーと一致する", () => {
    for (const [itemId, material] of Object.entries(rawMaterials)) {
      expect(itemNames, `${itemId} の表示名がない`).toHaveProperty(itemId);
      expect(material.id).toBe(itemId);
    }
  });

  it("エイリアス以外の原材料は産出地を持つ", () => {
    const materials = Object.values(rawMaterials).filter((material) => !(material.id in aliases));
    for (const material of materials) {
      expect(material.foundOn.length, `${material.id} の産出地がない`).toBeGreaterThan(0);
    }
  });

  it("エイリアスの構成アイテムはすべて原材料として存在する", () => {
    for (const [aliasId, items] of Object.entries(aliases)) {
      expect(rawMaterials, `${aliasId} が原材料に登録されていない`).toHaveProperty(aliasId);
      for (const item of items) {
        expect(rawMaterials, `${aliasId} の構成アイテム ${item} が原材料にない`).toHaveProperty(item);
      }
    }
  });

  it("アップグレードの要求アイテムはすべて表示名を持ち、原材料かレシピ持ちのどちらかである", () => {
    for (const upgrade of upgrades) {
      for (const upgradeLevel of upgrade.levels) {
        for (const requirement of upgradeLevel.requirements) {
          const label = `${upgrade.id} Lv${upgradeLevel.level} の要求 ${requirement.item}`;
          expect(itemNames, `${label} の表示名がない`).toHaveProperty(requirement.item);
          expect(
            requirement.item in rawMaterials || requirement.item in recipes,
            `${label} が原材料でもレシピ持ちでもない`,
          ).toBe(true);
        }
      }
    }
  });

  it("アップグレードの id は一意で、レベルは 1 からの連番である", () => {
    const ids = upgrades.map((upgrade) => upgrade.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const upgrade of upgrades) {
      const levels = upgrade.levels.map((upgradeLevel) => upgradeLevel.level);
      expect(levels, `${upgrade.id} のレベルが連番でない`).toEqual(levels.map((_, index) => index + 1));
    }
  });
});
