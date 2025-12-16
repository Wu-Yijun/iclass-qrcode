import React, { useState } from 'react';
import { SavedItem } from '../types';
import { Trash2, Plus, Share2, ArrowLeft } from 'lucide-react';
import { encodeShareData } from '../utils';

interface EditViewProps {
  items: SavedItem[];
  onUpdate: (items: SavedItem[]) => void;
  onBack: () => void;
}

const EditView: React.FC<EditViewProps> = ({ items, onUpdate, onBack }) => {
  const [localItems, setLocalItems] = useState<SavedItem[]>(items);
  const [newItemId, setNewItemId_raw] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const setNewItemId = (id: string) => setNewItemId_raw(id.replaceAll(/[^0-9]/g, ""));

  const handleDelete = (index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
    onUpdate(updated);
  };

  const handleAdd = () => {
    if (!newItemId || !newItemLabel) return;
    const newItem: SavedItem = {
      id: newItemId,
      label: newItemLabel,
      timestamp: Date.now()
    };
    const updated = [newItem, ...localItems];
    setLocalItems(updated);
    onUpdate(updated);
    setNewItemId('');
    setNewItemLabel('');
  };

  const handleEdit = (index: number, field: 'id' | 'label', value: string) => {
    const updated = [...localItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "id" ?
        value.replaceAll(/[^0-9]/g, "") :
        value
    };
    setLocalItems(updated);
    onUpdate(updated);
  };

  const handleShareAll = () => {
    const shareStr = encodeShareData(localItems);
    const url = `${window.location.origin}${window.location.pathname}?share=${shareStr}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Manage Tags</h1>
        <button onClick={handleShareAll} className="p-2 text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Share2 size={16} />
          <span className="hidden sm:inline">Share All</span>
        </button>
      </div>

      {/* Add New */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-5">
        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Add New Tag</h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Tag Name"
            className="sm:col-span-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-xs"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
          />
          <input
            type="text"
            placeholder="Course ID"
            className="sm:col-span-6 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-xs font-mono"
            value={newItemId}
            onChange={(e) => setNewItemId(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={!newItemId || !newItemLabel}
            className="sm:col-span-2 flex items-center justify-center bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {localItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm">
            No saved tags. Add one above.
          </div>
        )}
        {localItems.map((item, idx) => (
          <div key={idx} className="relative bg-white p-3 pr-8 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-2 group hover:border-brand-200 transition-colors">
            <div className="w-full">
              <label className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider">Label</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleEdit(idx, 'label', e.target.value)}
                className="w-full text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent focus:border-brand-300 outline-none py-0.5"
              />
            </div>
            <div className="w-full">
              <label className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider">ID</label>
              <input
                type="text"
                value={item.id}
                onChange={(e) => handleEdit(idx, 'id', e.target.value)}
                className="w-full text-xs font-mono text-gray-600 bg-transparent border-b border-transparent focus:border-brand-300 outline-none py-0.5"
              />
            </div>
            {/* Delete button: Absolute top-right */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => handleDelete(idx)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditView;