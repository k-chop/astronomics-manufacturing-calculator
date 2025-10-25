import { useEffect, useRef, useState } from "react";
import { searchItems } from "../data/item-names";

type ItemSearchProps = {
  onSelect: (itemId: string) => void;
  locale?: string;
  inputId?: string;
};

export function ItemSearch({ onSelect, locale = "en", inputId }: ItemSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchItems(query, locale);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, locale]);

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setIsOpen(true)}
        placeholder="Search items..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              type="button"
              key={result.id}
              onClick={() => handleSelect(result.id)}
              className={`w-full text-left px-4 py-2 cursor-pointer ${
                index === selectedIndex
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">{result.name}</div>
              <div
                className={`text-sm ${
                  index === selectedIndex ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {result.id}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
