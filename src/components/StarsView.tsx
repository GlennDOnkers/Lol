import { useState } from 'react';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { MapView } from './MapView';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import { Star, Clock, DollarSign, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StarsViewProps {
  activities: Activity[];
}

export function StarsView({ activities }: StarsViewProps) {
  const { starredIds, toggleStar } = useAppStore();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const starredActivities = activities.filter(a => starredIds.includes(a.id));
  
  const totalDays = starredActivities.reduce((sum, a) => sum + a.daysNeeded, 0);
  const minCost = starredActivities.reduce((sum, a) => sum + a.costRange[0], 0);
  const maxCost = starredActivities.reduce((sum, a) => sum + a.costRange[1], 0);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 p-4 md:p-6">
      {/* Left Panel: List & Summary */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-200">
        
        {/* Summary Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Star className="w-7 h-7 text-yellow-500 dark:text-yellow-400 fill-current" />
            </div>
            Opgeslagen Favorieten
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-800/50 p-5 rounded-2xl border border-stone-100 dark:border-stone-700/50 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
                <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Totaal Dagen</span>
              </div>
              <p className="text-3xl font-display font-semibold text-stone-900 dark:text-white">{totalDays} <span className="text-sm font-medium text-stone-500 dark:text-stone-400">dagen</span></p>
            </div>
            
            <div className="bg-white dark:bg-stone-800/50 p-5 rounded-2xl border border-stone-100 dark:border-stone-700/50 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
                <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Geschatte Kosten</span>
              </div>
              <p className="text-3xl font-display font-semibold text-stone-900 dark:text-white">
                €{minCost} <span className="text-sm font-medium text-stone-500 dark:text-stone-400">- €{maxCost}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          <AnimatePresence>
            {starredActivities.map((activity) => (
              <motion.div 
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedActivity(activity)}
                className="bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 rounded-2xl p-5 flex items-start justify-between group hover:border-yellow-300 dark:hover:border-yellow-500/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="pr-4">
                  <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-white mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors leading-tight">{activity.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                    <span className="capitalize bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{activity.category}</span>
                    <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{activity.region}</span>
                    <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.daysNeeded} d</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleStar(activity.id); }}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 shrink-0"
                  title="Verwijder uit favorieten"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {starredActivities.length === 0 && (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Je hebt nog geen activiteiten opgeslagen.</p>
              <p className="text-sm mt-2">Ga naar 'Browse' om activiteiten te zoeken en een ster te geven.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className="hidden md:block w-1/2 lg:w-7/12 h-full">
        <MapView activities={activities} showAll={false} selectedActivityId={selectedActivity?.id} />
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal 
          activity={selectedActivity} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}
    </div>
  );
}
