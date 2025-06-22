import React, { useEffect, useState } from 'react';
import { FaSearch } from "react-icons/fa";

export default function SearchBar_Modal({ onResultSelect, fetchData, renderResultItem, locId }) {
    const [input, setInput] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (input.trim()) {
                setLoading(true);
                try {
                    const data = await fetchData(input, locId);
                    setResults(data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Error en búsqueda:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 400); // debounce de 400ms

        return () => clearTimeout(delayDebounce);
    }, [input]);

  return (
    <div className="relative w-full">
      <div className="input-wrapper flex items-center border px-3 py-2 rounded bg-white">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Type to search..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onResultSelect(item);
                setInput("");
                setShowDropdown(false);
              }}
            >
              {renderResultItem(item)}
            </li>
          ))}
        </ul>
      )}

      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow px-4 py-2 text-gray-500 italic">
          Sin resultados.
        </div>
      )}
    </div>
  )
}
