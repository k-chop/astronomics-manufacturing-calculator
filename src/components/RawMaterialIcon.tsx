/**
 * Icon to indicate a raw material (looks like a small rock/asteroid icon)
 */
export function RawMaterialIcon() {
  return (
    <svg
      className="inline-block w-4 h-4 ml-1"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-label="Raw Material"
    >
      <title>Raw Material</title>
      <path d="M8 1L3 4L3 12L8 15L13 12L13 4L8 1Z" />
      <circle cx="6" cy="6" r="1" opacity="0.6" />
      <circle cx="10" cy="8" r="1" opacity="0.6" />
      <circle cx="7" cy="10" r="1" opacity="0.6" />
    </svg>
  );
}
