import { useMemo, useState } from "react";

import { CatalogTree } from "./components/CatalogTree";
import { ContractResult } from "./components/ContractResult";
import { GitHubIcon } from "./components/GitHubIcon";
import { InventoryPanel } from "./components/InventoryPanel";
import { ItemUsage } from "./components/ItemUsage";
import { ManufacturingResult } from "./components/ManufacturingResult";
import { ProductionPlanList } from "./components/ProductionPlanList";
import { RawMaterialSource } from "./components/RawMaterialSource";
import { SettingsDialog } from "./components/SettingsDialog";
import { UpgradeResult } from "./components/UpgradeResult";
import { calculateManufacturing } from "./lib/calculator";
import { getSelectionId, type Selection } from "./lib/catalog-tree";
import { loadProductionPlan, saveProductionPlan } from "./lib/production-plan-storage";
import {
  addContractToPlan,
  addItemToPlan,
  addUpgradeToPlan,
  analyzePlan,
  recordStepRuns,
  removeItemFromPlan,
  setInventory,
  toggleItemCompletion,
} from "./lib/production-plan-utils";
import { getMinimumAmount } from "./lib/recipe-utils";
import { loadShowContracts, saveShowContracts } from "./lib/ui-preferences-storage";
import type { ProductionPlan } from "./types/production-plan";

export const App = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [showContracts, setShowContracts] = useState<boolean>(() => loadShowContracts());
  const [productionPlan, setProductionPlan] = useState<ProductionPlan>(() => {
    // 初期値としてlocalStorageから読み込む
    return loadProductionPlan();
  });

  // 計画の更新時にlocalStorageへ保存する
  const updateProductionPlan = (newPlan: ProductionPlan) => {
    setProductionPlan(newPlan);
    saveProductionPlan(newPlan);
  };

  const handleSelect = (newSelection: Selection) => {
    setSelection(newSelection);
    if (newSelection.kind === "item") {
      setAmount(getMinimumAmount(newSelection.itemId));
    }
  };

  const handleItemSelect = (itemId: string) => handleSelect({ kind: "item", itemId });
  const handleUpgradeSelect = (upgradeId: string, level: number) => handleSelect({ kind: "upgrade", upgradeId, level });
  const handleContractSelect = (contractId: string) => handleSelect({ kind: "contract", contractId });

  // 契約を隠したら、選択中の契約も閉じる
  const handleShowContractsChange = (show: boolean) => {
    setShowContracts(show);
    saveShowContracts(show);
    if (!show && selection?.kind === "contract") {
      setSelection(null);
    }
  };

  const selectedItem = selection?.kind === "item" ? selection.itemId : null;
  const selectedUpgrade = selection?.kind === "upgrade" ? selection : null;
  const selectedContract = selection?.kind === "contract" ? selection.contractId : null;

  // 計算結果は選択中アイテムと個数から導出する
  const results = useMemo(
    () => (selectedItem ? calculateManufacturing(selectedItem, amount) : null),
    [selectedItem, amount],
  );

  const handleAmountChange = (newAmount: number) => {
    setAmount(Math.max(1, newAmount));
  };

  const handleReset = () => {
    if (selectedItem) {
      setAmount(getMinimumAmount(selectedItem));
    }
  };

  const handleAddToPlan = (patternIndex: number) => {
    if (selectedItem && results && results.length > 0) {
      updateProductionPlan(addItemToPlan(productionPlan, selectedItem, amount, results, patternIndex));
    }
  };

  const handleAddUpgradeToPlan = () => {
    if (selectedUpgrade) {
      updateProductionPlan(addUpgradeToPlan(productionPlan, selectedUpgrade.upgradeId, selectedUpgrade.level));
    }
  };

  const handleAddContractToPlan = () => {
    if (selectedContract) {
      updateProductionPlan(addContractToPlan(productionPlan, selectedContract));
    }
  };

  const handleRemoveFromPlan = (entryId: string) => {
    updateProductionPlan(removeItemFromPlan(productionPlan, entryId));
  };

  const handleToggleCompletion = (entryId: string) => {
    updateProductionPlan(toggleItemCompletion(productionPlan, entryId));
  };

  const handleUpdateInventory = (itemId: string, have: number) => {
    updateProductionPlan(setInventory(productionPlan, itemId, have));
  };

  const handleRecordStepRuns = (entryId: string, stepIndex: number, delta: number) => {
    updateProductionPlan(recordStepRuns(productionPlan, entryId, stepIndex, delta));
  };

  const planAnalysis = useMemo(() => analyzePlan(productionPlan), [productionPlan]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Astronomics Manufacturing Calculator</h1>
          <div className="flex items-center gap-4">
            <SettingsDialog showContracts={showContracts} onShowContractsChange={handleShowContractsChange} />
            <a
              href="https://github.com/k-chop/astronomics-manufacturing-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="sr-only">GitHub Repository</span>
              <GitHubIcon />
            </a>
          </div>
        </div>

        {/* 3-column layout: Left (Catalog) + Center (Details) + Right (Production Plan) */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)] gap-6">
          {/* Left Column: Catalog Tree */}
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-scroll">
            <CatalogTree
              selectedId={selection ? getSelectionId(selection) : null}
              onSelect={handleSelect}
              showContracts={showContracts}
            />
          </div>

          {/* Center Column: Details */}
          <div className="space-y-6">
            {selection === null && (
              <div className="bg-white rounded-lg shadow-md p-6 text-gray-500 text-base">
                Select something from the list.
              </div>
            )}

            {/* Raw Material Source (shown above recipes when the item can be collected) */}
            {selectedItem && <RawMaterialSource itemId={selectedItem} />}

            {/* Upgrade Requirements */}
            {selectedUpgrade && (
              <UpgradeResult
                upgradeId={selectedUpgrade.upgradeId}
                level={selectedUpgrade.level}
                onAddToPlan={handleAddUpgradeToPlan}
              />
            )}

            {/* Contract Requirements */}
            {selectedContract && <ContractResult contractId={selectedContract} onAddToPlan={handleAddContractToPlan} />}

            {/* Manufacturing Results */}
            {results && selectedItem && (
              <ManufacturingResult
                results={results}
                targetItem={selectedItem}
                targetAmount={amount}
                onAmountChange={handleAmountChange}
                onReset={handleReset}
                onAddToPlan={handleAddToPlan}
              />
            )}

            {results === null && selectedItem && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  No manufacturing recipe found for this item. It can only be collected as a raw material.
                </div>
                <ItemUsage
                  itemId={selectedItem}
                  onSelectItem={handleItemSelect}
                  onSelectUpgrade={handleUpgradeSelect}
                  onSelectContract={handleContractSelect}
                  showContracts={showContracts}
                />
              </>
            )}
          </div>

          {/* Right Column: Production Plan */}
          <div className="space-y-6">
            {/* Materials & Inventory */}
            <InventoryPanel
              rows={planAnalysis.rows}
              craftsByOutput={planAnalysis.craftsByOutput}
              relations={planAnalysis.relations}
              collectionRoute={planAnalysis.collectionRoute}
              onUpdateInventory={handleUpdateInventory}
              onRecordStepRuns={handleRecordStepRuns}
            />

            {/* Production Plan List */}
            <ProductionPlanList
              plan={productionPlan}
              analysis={planAnalysis}
              onRemoveItem={handleRemoveFromPlan}
              onToggleCompletion={handleToggleCompletion}
              onRecordStepRuns={handleRecordStepRuns}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="space-y-1">
            <div>Compatible with Astronomics version 0.83.1</div>
            <div>
              Data sourced from{" "}
              <a
                href="https://astronomics.wiki.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Official Astronomics Wiki
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
