import { useState, useId } from "react";
import { ItemSearch } from "./components/ItemSearch";
import { ManufacturingResult } from "./components/ManufacturingResult";
import { getItemName } from "./data/item-names";
import type { CalculationResult } from "./lib/calculator";
import { calculateManufacturing } from "./lib/calculator";

export const App = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const itemSearchId = useId();
  const amountInputId = useId();

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    const calculationResults = calculateManufacturing(itemId, amount);
    setResults(calculationResults);
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    if (selectedItem) {
      const calculationResults = calculateManufacturing(selectedItem, newAmount);
      setResults(calculationResults);
    }
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
                <div className="flex items-center gap-4">
                  <input
                    id={amountInputId}
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    × {getItemName(selectedItem)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {results && selectedItem && (
          <ManufacturingResult
            results={results}
            targetItem={selectedItem}
            targetAmount={amount}
          />
        )}

        {results === null && selectedItem && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            No manufacturing recipe found for this item. It may only be available as a raw material.
          </div>
        )}
      </div>
    </div>
  );
};
