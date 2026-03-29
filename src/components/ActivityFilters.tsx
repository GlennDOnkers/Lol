import { useAppStore } from '../store';
import { Filter } from 'lucide-react';

export function ActivityFilters() {
  const { filters, setFilters } = useAppStore();

  return (
    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm mb-4">
      <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
        <Filter className="w-4 h-4" /> Filters
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ category: e.target.value || null })}
          className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle categorieën</option>
          <option value="adventure">Avontuur</option>
          <option value="nature">Natuur</option>
          <option value="culture">Cultuur</option>
          <option value="parks">Parken</option>
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ priority: e.target.value || null })}
          className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle prioriteiten</option>
          <option value="High">Hoog</option>
          <option value="Medium">Medium</option>
          <option value="Low">Laag</option>
        </select>
        <input
          type="number"
          placeholder="Min. dagen"
          value={filters.minDays || ''}
          onChange={(e) => setFilters({ minDays: e.target.value ? parseInt(e.target.value) : null })}
          className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Max. kosten"
          value={filters.maxCost || ''}
          onChange={(e) => setFilters({ maxCost: e.target.value ? parseInt(e.target.value) : null })}
          className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
