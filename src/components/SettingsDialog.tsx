import { useRef } from "react";

import { GearIcon } from "./GearIcon";

type SettingsDialogProps = {
  showContracts: boolean;
  onShowContractsChange: (show: boolean) => void;
};

/**
 * 右上のギアから開く設定ダイアログ（ネイティブ <dialog> をモーダルで開く）
 */
export function SettingsDialog({ showContracts, onShowContractsChange }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        onClick={() => dialogRef.current?.showModal()}
        className="text-gray-700 hover:text-gray-900 transition-colors"
      >
        <GearIcon />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Settings"
        className="m-auto w-full max-w-md rounded-lg shadow-xl p-0 backdrop:bg-black/40"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
          <div className="flex items-start gap-3">
            <input
              id="settings-show-contracts"
              type="checkbox"
              checked={showContracts}
              onChange={(e) => onShowContractsChange(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label htmlFor="settings-show-contracts" className="block text-base font-medium text-gray-900">
                Show contracts
              </label>
              <p className="text-sm text-gray-500">Possible spoiler: contracts are revealed one by one in game.</p>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-base font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
