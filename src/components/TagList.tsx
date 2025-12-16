import React from "react";
import { SavedItem } from "../types";

interface TagListProps {
  items: SavedItem[];
  onSelect: (id: string) => void;
  currentId: string;
}

const TagList: React.FC<TagListProps> = ({ items, onSelect, currentId }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex space-x-1.5">
        {items.map((item, idx) => {
          const isActive = item.id === currentId;
          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelect(item.id)}
              className={`
                        flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                        ${
                isActive
                  ? "bg-brand-600 text-white border-brand-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600"
              }
                    `}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagList;
