import { useState } from 'react';
import { useAppStore } from '../store';
import { PackingItem } from '../types';
import { Briefcase, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Kleding', 'Elektronica', 'Documenten', 'Diversen'] as const;

export function PackingListView() {
  const { packingList, addPackingItem, togglePackingItem, removePackingItem } = useAppStore();
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackingItem['category']>('Kleding');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    addPackingItem({
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false,
      category: selectedCategory,
    });
    setNewItemText('');
  };

  const itemsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = packingList.filter(item => item.category === cat);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const totalItems = packingList.length;
  const packedItems = packingList.filter(i => i.checked).length;
  const progress = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-500" />
            </div>
            Inpaklijst
          </h2>
          <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 px-4 py-2 rounded-xl border border-stone-100 dark:border-stone-700/50">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
              <span className="text-stone-900 dark:text-white font-display font-semibold text-base">{packedItems}</span> van {totalItems} ingepakt
            </span>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3 mb-10 overflow-hidden shadow-inner border border-stone-200/50 dark:border-stone-700/50">
          <motion.div 
            className="bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-3 mb-10 bg-stone-50/50 dark:bg-stone-800/30 p-2 rounded-2xl border border-stone-100 dark:border-stone-700/50">
          <input
            type="text"
            placeholder="Nieuw item (bijv. Zonnebrand)"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium placeholder:font-normal"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PackingItem['category'])}
            className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium rounded-xl hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Toevoegen</span>
          </button>
        </form>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(category => {
            const items = itemsByCategory[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-100 dark:border-stone-700/50 transition-colors">
                <h3 className="font-display font-semibold text-stone-800 dark:text-stone-200 text-lg mb-5 flex items-center justify-between">
                  {category}
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                    {items.filter(i => i.checked).length}/{items.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-colors group"
                      >
                        <button
                          onClick={() => togglePackingItem(item.id)}
                          className={`flex items-center gap-3 flex-1 text-left ${item.checked ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-700 dark:text-stone-200'} transition-colors`}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0 transition-colors" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0 transition-colors group-hover:text-orange-400 dark:group-hover:text-orange-500" />
                          )}
                          <span className="text-sm font-medium">{item.text}</span>
                        </button>
                        <button
                          onClick={() => removePackingItem(item.id)}
                          className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
