import { useState, useId, useEffect } from "react";
import { ItemSearch } from "./components/ItemSearch";
import { ManufacturingResult } from "./components/ManufacturingResult";
import { MaterialsSummary } from "./components/MaterialsSummary";
import { ProductionPlanList } from "./components/ProductionPlanList";
import { getItemName } from "./data/item-names";
import type { CalculationResult } from "./lib/calculator";
import { calculateManufacturing } from "./lib/calculator";
import {
  loadProductionPlan,
  saveProductionPlan,
} from "./lib/production-plan-storage";
import {
  addItemToPlan,
  removeItemFromPlan,
  toggleItemCompletion,
  updateMaterialProgress,
  aggregateMaterials,
} from "./lib/production-plan-utils";
import { getMinimumAmount } from "./lib/recipe-utils";
import type { ProductionPlan } from "./types/production-plan";

export const App = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [productionPlan, setProductionPlan] = useState<ProductionPlan>({
    items: [],
  });
  const itemSearchId = useId();
  const amountInputId = useId();

  // localStorageから計画を読み込み
  useEffect(() => {
    const loadedPlan = loadProductionPlan();
    setProductionPlan(loadedPlan);
  }, []);

  // 計画が変更されたらlocalStorageに保存
  useEffect(() => {
    saveProductionPlan(productionPlan);
  }, [productionPlan]);

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
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Astronomics Manufacturing Calculator
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor={itemSearchId} className="block text-sm font-medium text-gray-700 mb-2">
                Select Item
              </label>
              <ItemSearch onSelect={handleItemSelect} inputId={itemSearchId} />
            </div>

            {selectedItem && (
              <div>
                <label htmlFor={amountInputId} className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={amountInputId}
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAmountChange(amount + 1)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmountChange(amount + 5)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmountChange(amount * 2)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                    >
                      x2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmountChange(amount * 5)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                    >
                      x5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmountChange(amount * 10)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                    >
                      x10
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
                    >
                      reset
                    </button>
                  </div>
                  <span className="text-gray-700">
                    × {getItemName(selectedItem)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {results && selectedItem && (
          <>
            <ManufacturingResult
              results={results}
              targetItem={selectedItem}
              targetAmount={amount}
            />
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleAddToPlan}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium shadow-md"
              >
                Add to Production Plan
              </button>
            </div>
          </>
        )}

        {results === null && selectedItem && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            No manufacturing recipe found for this item. It may only be available as a raw material.
          </div>
        )}

        {/* Total Materials Summary */}
        {productionPlan.items.length > 0 && (
          <div className="mt-8">
            <MaterialsSummary materials={aggregateMaterials(productionPlan)} />
          </div>
        )}

        {/* Production Plan List */}
        <div className="mt-8">
          <ProductionPlanList
            plan={productionPlan}
            onRemoveItem={handleRemoveFromPlan}
            onToggleCompletion={handleToggleCompletion}
            onUpdateMaterialProgress={handleUpdateMaterialProgress}
          />
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
