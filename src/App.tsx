import { useEffect, useId, useState } from "react";
import { GitHubIcon } from "./components/GitHubIcon";
import { ItemSearch } from "./components/ItemSearch";
import { ManufacturingResult } from "./components/ManufacturingResult";
import { MaterialsSummary } from "./components/MaterialsSummary";
import { ProductionPlanList } from "./components/ProductionPlanList";
import type { CalculationResult } from "./lib/calculator";
import { calculateManufacturing } from "./lib/calculator";
import {
  loadProductionPlan,
  saveProductionPlan,
} from "./lib/production-plan-storage";
import {
  addItemToPlan,
  aggregateMaterials,
  removeItemFromPlan,
  toggleItemCompletion,
  updateMaterialProgress,
} from "./lib/production-plan-utils";
import { getMinimumAmount } from "./lib/recipe-utils";
import type { ProductionPlan } from "./types/production-plan";

export const App = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [productionPlan, setProductionPlan] = useState<ProductionPlan>(() => {
    // 初期値としてlocalStorageから読み込む
    return loadProductionPlan();
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const itemSearchId = useId();

  // 初期化完了フラグ
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 計画が変更されたらlocalStorageに保存（初回は除く）
  useEffect(() => {
    if (isInitialized) {
      saveProductionPlan(productionPlan);
    }
  }, [productionPlan, isInitialized]);

  const handleItemSelect = (itemId: string) => {
    const minAmount = getMinimumAmount(itemId);
    setSelectedItem(itemId);
    setAmount(minAmount);
    const calculationResults = calculateManufacturing(itemId, minAmount);
    setResults(calculationResults);
  };

  const handleAmountChange = (newAmount: number) => {
    const validAmount = Math.max(1, newAmount);
    setAmount(validAmount);
    if (selectedItem) {
      const calculationResults = calculateManufacturing(selectedItem, validAmount);
      setResults(calculationResults);
    }
  };

  const handleReset = () => {
    if (selectedItem) {
      const minAmount = getMinimumAmount(selectedItem);
      handleAmountChange(minAmount);
    }
  };

  const handleAddToPlan = () => {
    if (selectedItem && results && results.length > 0) {
      const newPlan = addItemToPlan(productionPlan, selectedItem, amount, results);
      setProductionPlan(newPlan);
    }
  };

  const handleRemoveFromPlan = (itemId: string) => {
    const newPlan = removeItemFromPlan(productionPlan, itemId);
    setProductionPlan(newPlan);
  };

  const handleToggleCompletion = (itemId: string) => {
    const newPlan = toggleItemCompletion(productionPlan, itemId);
    setProductionPlan(newPlan);
  };

  const handleUpdateMaterialProgress = (
    itemId: string,
    materialId: string,
    collected: number,
  ) => {
    const newPlan = updateMaterialProgress(
      productionPlan,
      itemId,
      materialId,
      collected,
    );
    setProductionPlan(newPlan);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Astronomics Manufacturing Calculator
          </h1>
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

        {/* 2-column layout: Left (Calculator) + Right (Production Plan) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Calculator */}
          <div className="space-y-8">
            {/* Select Item */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label htmlFor={itemSearchId} className="block text-sm font-medium text-gray-700 mb-2">
                Select Item
              </label>
              <ItemSearch onSelect={handleItemSelect} inputId={itemSearchId} />
            </div>

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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                No manufacturing recipe found for this item. It may only be available as a raw material.
              </div>
            )}
          </div>

          {/* Right Column: Production Plan */}
          <div className="space-y-8">
            {/* Total Materials Summary */}
            {productionPlan.items.length > 0 && (
              <MaterialsSummary materials={aggregateMaterials(productionPlan)} />
            )}

            {/* Production Plan List */}
            <ProductionPlanList
              plan={productionPlan}
              onRemoveItem={handleRemoveFromPlan}
              onToggleCompletion={handleToggleCompletion}
              onUpdateMaterialProgress={handleUpdateMaterialProgress}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <div className="space-y-1">
            <div>Compatible with Astronomics version 0.77.5</div>
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
