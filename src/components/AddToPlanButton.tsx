type AddToPlanButtonProps = {
  subtitle: string; // 何を追加するか（"20 × Graphite" / "Fuel Capacity Lv2"）
  onClick: () => void;
};

export function AddToPlanButton({ subtitle, onClick }: AddToPlanButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-end gap-1 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md shrink-0 text-right"
    >
      <span className="font-medium leading-none">Add to Plan</span>
      <span className="text-xs text-purple-200 leading-none">{subtitle}</span>
    </button>
  );
}
