import { getContract, getContractName, getStationName } from "../data/contracts";
import type { Locale } from "../data/item-names";
import { formatNumber } from "../lib/format-utils";
import { resolveRequirements } from "../lib/production-plan-utils";
import { AddToPlanButton } from "./AddToPlanButton";
import { RequirementsSummary } from "./RequirementsSummary";

type ContractResultProps = {
  contractId: string;
  onAddToPlan: () => void;
  locale?: Locale;
};

export function ContractResult({ contractId, onAddToPlan, locale = "en" }: ContractResultProps) {
  const contract = getContract(contractId);
  if (!contract) return null;

  const name = getContractName(contractId, locale);
  const requirements = resolveRequirements([contract.requirement]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-semibold">{name}</div>
            <div className="text-base text-gray-600">
              {getStationName(contract.station, locale)} · #{contract.number} · Reward {formatNumber(contract.reward)}◆
            </div>
            {contract.note !== undefined && <div className="text-sm text-gray-500 mt-1">{contract.note}</div>}
          </div>
          <AddToPlanButton subtitle={name} onClick={onAddToPlan} />
        </div>

        <RequirementsSummary requirements={requirements} locale={locale} />
      </div>
    </div>
  );
}
