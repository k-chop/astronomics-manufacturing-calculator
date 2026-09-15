import { type ReactNode, useState } from "react";

import { type AsteroidName, type Composition, getAsteroidInfo, getCompositionName } from "../data/asteroid";
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

const placeClass = "whitespace-nowrap font-medium text-gray-900";

/**
 * 場所の名前。小惑星なら「CC4 - Cube Corp」、星雲や any なら名前だけ
 */
function SiteName({ id, locale }: { id: AsteroidName; locale: Locale }) {
  const info = getAsteroidInfo(id, locale);
  return <span className={placeClass}>{info.region === undefined ? info.name : `${info.name} - ${info.region}`}</span>;
}

/**
 * 「その組成の小惑星ならどこでもよい」停泊地の名前
 */
function AnyAsteroidName({ composition, locale }: { composition: Composition; locale: Locale }) {
  return <span className={placeClass}>Any {getCompositionName(composition, locale)} asteroid</span>;
}

/**
 * 経路の 1 行（番号・場所・材料の 3 列）。親の grid に列を流し込むので li 自体は contents にする
 * number があれば停泊順を付ける
 */
function RouteLine({ number, place, children }: { number?: number; place: ReactNode; children: ReactNode }) {
  return (
    <li className="contents">
      <span className="font-mono text-right text-gray-500">{number === undefined ? "" : `${number}.`}</span>
      {place}
      <span className="flex flex-wrap gap-x-2">{children}</span>
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
        <ol className="grid grid-cols-[max-content_max-content_1fr] gap-x-3 gap-y-0.5 items-baseline">
          {stops.map(({ id, anyOf, items, bonus }, index) => (
            <RouteLine
              key={id}
              number={index + 1}
              place={
                anyOf === null ? (
                  <SiteName id={id} locale={locale} />
                ) : (
                  <AnyAsteroidName composition={anyOf} locale={locale} />
                )
              }
            >
              <SiteItems items={items} locale={locale} />
              {bonus.length > 0 && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  (maybe {bonus.map(({ item }) => getItemName(item, locale)).join(", ")})
                </span>
              )}
            </RouteLine>
          ))}
          {nebulae.map(({ id, items }, index) => (
            <RouteLine key={id} number={stops.length + index + 1} place={<SiteName id={id} locale={locale} />}>
              <SiteItems items={items} locale={locale} />
            </RouteLine>
          ))}
          {anywhere.length > 0 && (
            <RouteLine place={<span className={placeClass}>Any asteroid along the way</span>}>
              <SiteItems items={anywhere} locale={locale} />
            </RouteLine>
          )}
        </ol>
      )}
    </div>
  );
}
