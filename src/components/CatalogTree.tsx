import { useMemo, useState } from "react";

import type { Locale } from "../data/item-names";
import { buildCatalogTree, filterTree, type Selection, type TreeNode } from "../lib/catalog-tree";
import { RawMaterialIcon } from "./RawMaterialIcon";

type CatalogTreeProps = {
  selectedId: string | null;
  onSelect: (selection: Selection) => void;
  locale?: Locale;
};

type TreeNodeViewProps = {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  collapsed: Set<string>;
  forceExpand: boolean;
  onToggle: (branchId: string) => void;
  onSelect: (selection: Selection) => void;
};

function TreeNodeView({ node, depth, selectedId, collapsed, forceExpand, onToggle, onSelect }: TreeNodeViewProps) {
  const indentStyle = { paddingLeft: `${depth * 0.75}rem` };

  if (node.kind === "leaf") {
    const isSelected = node.id === selectedId;
    return (
      <button
        type="button"
        aria-label={node.label}
        onClick={() => onSelect(node.selection)}
        style={indentStyle}
        className={`w-full text-left text-sm rounded px-2 py-1 flex items-center ${
          isSelected ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-100"
        }`}
      >
        <span className="truncate">{node.label}</span>
        {node.isRaw && (
          <span className={isSelected ? "text-blue-100" : "text-green-600"}>
            <RawMaterialIcon />
          </span>
        )}
      </button>
    );
  }

  const isExpanded = forceExpand || !collapsed.has(node.id);
  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => onToggle(node.id)}
        style={indentStyle}
        className="w-full text-left text-sm font-medium text-gray-700 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1"
      >
        <span className="inline-block w-3 text-gray-400">{isExpanded ? "▾" : "▸"}</span>
        <span>{node.label}</span>
      </button>
      {isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              collapsed={collapsed}
              forceExpand={forceExpand}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CatalogTree({ selectedId, onSelect, locale = "en" }: CatalogTreeProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildCatalogTree(locale), [locale]);
  const visibleTree = useMemo(() => filterTree(tree, query), [tree, query]);
  const isFiltering = query.trim() !== "";

  const handleToggle = (branchId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* スクロールしても検索窓は上部に固定する（余白と背景を持たせてツリーが下を通っても透けないようにする） */}
      <div className="sticky top-0 z-10 bg-white rounded-t-lg px-4 pt-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter items and upgrades..."
            aria-label="Filter items and upgrades"
            className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isFiltering && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs leading-none hover:bg-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {visibleTree.length === 0 ? (
        <p className="text-sm text-gray-500 px-6 pb-4">No items or upgrades match.</p>
      ) : (
        <div className="space-y-0.5 px-4 pb-4">
          {visibleTree.map((node) => (
            <TreeNodeView
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              collapsed={collapsed}
              forceExpand={isFiltering}
              onToggle={handleToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
