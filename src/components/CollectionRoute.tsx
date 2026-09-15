import { type ReactNode, useState } from "react";

import { type AsteroidName, getAsteroidInfo } from "../data/asteroid";
import { getItemName, type Locale } from "../data/item-names";
import type { CollectionRoute as CollectionRouteData, SiteItem } from "../lib/collection-route";
import { formatNumber } from "../lib/format-utils";
import { loadShowRoute, saveShowRoute } from "../lib/ui-preferences-storage";

type CollectionRouteProps = {
  route: CollectionRouteData;
  locale?: Locale;
};

function SiteItems({ items, locale }: { items: SiteItem[]; locale: Locale }) {
  return (
    <span className="text-gray-700">
      {items.map(({ item, missing }, index) => (
        <span key={item} className="whitespace-nowrap">
          {index > 0 && ", "}
          {getItemName(item, locale)} <span className="font-mono text-red-600">×{formatNumber(missing)}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * 場所の名前。小惑星なら FoundOnList と同じ列構成（ID - リージョン (組成)）、星雲や any なら名前だけ
 */
function SiteName({ id, locale }: { id: AsteroidName; locale: Locale }) {
  const info = getAsteroidInfo(id, locale);
  if (info.region && info.compositon) {
    return (
      <span className="flex gap-2 whitespace-nowrap text-gray-900">
        <span className="font-mono inline-block w-9">{info.name}</span>
        <span>-</span>
        <span className="inline-block min-w-32">{info.region}</span>
        <span className="text-gray-500">({info.compositon})</span>
      </span>
    );
  }
  return <span className="whitespace-nowrap text-gray-900">{info.name}</span>;
}

/**
 * 経路の 1 行。number があれば停泊順を付ける
 */
function RouteLine({ number, children }: { number?: number; children: ReactNode }) {
  return (
    <li className="flex flex-wrap gap-x-2 gap-y-0.5">
      <span className="font-mono inline-block w-5 text-right text-gray-500">
        {number === undefined ? "" : `${number}.`}
      </span>
      {children}
    </li>
  );
}

/**
 * 集めるもののうち足りないものを、この順に回れば全部揃うという形で出す
 * 小惑星の停泊地 → 星雲 → どの小惑星でも取れるもの。チェックボックスで ON にしたときだけ出す
 */
export function CollectionRoute({ route, locale = "en" }: CollectionRouteProps) {
  const [showRoute, setShowRoute] = useState(loadShowRoute);
  const { stops, nebulae, anywhere } = route;

  const handleToggle = (show: boolean) => {
    setShowRoute(show);
    saveShowRoute(show);
  };

  return (
    <div className="text-base">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Where to go</span>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showRoute} onChange={(e) => handleToggle(e.target.checked)} />
          Suggest a route
        </label>
      </div>
      {showRoute && (
        <ol className="space-y-0.5">
          {stops.map(({ id, items, bonus }, index) => (
            <RouteLine key={id} number={index + 1}>
              <SiteName id={id} locale={locale} />
              <SiteItems items={items} locale={locale} />
              {bonus.length > 0 && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  (maybe {bonus.map(({ item }) => getItemName(item, locale)).join(", ")})
                </span>
              )}
            </RouteLine>
          ))}
          {nebulae.map(({ id, items }, index) => (
            <RouteLine key={id} number={stops.length + index + 1}>
              <SiteName id={id} locale={locale} />
              <SiteItems items={items} locale={locale} />
            </RouteLine>
          ))}
          {anywhere.length > 0 && (
            <RouteLine>
              <span className="text-gray-900">Any asteroid along the way</span>
              <SiteItems items={anywhere} locale={locale} />
            </RouteLine>
          )}
        </ol>
      )}
    </div>
  );
}
