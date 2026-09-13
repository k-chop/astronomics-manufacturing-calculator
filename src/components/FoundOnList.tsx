import { type AsteroidName, getAsteroidInfo } from "../data/asteroid";
import type { Locale } from "../data/item-names";

type FoundOnListProps = {
  foundOn: AsteroidName[];
  locale?: Locale;
  mutedClassName?: string;
};

/**
 * List of asteroids (or nebulae) where a raw material can be collected.
 */
export function FoundOnList({ foundOn, locale = "en", mutedClassName = "text-gray-400" }: FoundOnListProps) {
  return (
    <div className="space-y-0.5">
      {foundOn.map((asteroid) => {
        const info = getAsteroidInfo(asteroid, locale);
        if (info.region && info.compositon) {
          return (
            <div key={asteroid} className="flex gap-2 whitespace-nowrap">
              <span className="font-mono inline-block w-9 text-right">{info.name}</span>
              <span>-</span>
              <span className="inline-block min-w-32">{info.region}</span>
              <span className={mutedClassName}>({info.compositon})</span>
            </div>
          );
        } else {
          return <div key={asteroid}>{info.name}</div>;
        }
      })}
    </div>
  );
}
