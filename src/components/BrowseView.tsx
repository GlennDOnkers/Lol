import { useState } from 'react';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { Star, MapPin, Filter, Search, ExternalLink, Clock, DollarSign, Info } from 'lucide-react';
import { MapView } from './MapView';
import { WeatherWidget } from './WeatherWidget';
import { ActivityFilters } from './ActivityFilters';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BrowseViewProps {
  activities: Activity[];
}

export function BrowseView({ activities }: BrowseViewProps) {
  const { starredIds, pinnedIds, toggleStar, togglePin, filters, setFilters } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || activity.category === filters.category;
    const matchesPriority = !filters.priority || activity.priority === filters.priority;
    const matchesMinDays = !filters.minDays || activity.daysNeeded >= filters.minDays;
    const matchesMaxCost = !filters.maxCost || activity.costRange[1] <= filters.maxCost;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesMinDays && matchesMaxCost;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 p-4 md:p-6">
      {/* Left Panel: List & Filters */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-200">
        
        {/* Filters Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 space-y-4 transition-colors duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
            <input 
              type="text" 
              placeholder="Zoek activiteiten..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>
          
          <ActivityFilters />
          
          {(searchTerm !== '' || filters.category || filters.priority || filters.minDays || filters.maxCost) && (
            <button
              onClick={() => { 
                setSearchTerm(''); 
                setFilters({ category: null, priority: null, minDays: null, maxCost: null }); 
              }}
              className="w-full px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          <WeatherWidget activities={activities} />
          <AnimatePresence>
            {filteredActivities.map((activity) => {
              const isStarred = starredIds.includes(activity.id);
              const isPinned = pinnedIds.includes(activity.id);
              
              return (
                <motion.div 
                  key={activity.id}
                  id={`activity-${activity.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                  className={cn(
                    "border rounded-2xl p-4 transition-all group cursor-pointer",
                    expandedActivityId === activity.id 
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md" 
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 text-xl group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight pr-4">
                      {activity.title}
                    </h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          togglePin(activity.id); 
                        }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isPinned ? "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400" : "text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                        )}
                        title={isPinned ? "Verwijder pin" : "Pin op kaart"}
                      >
                        <MapPin className={cn("w-4 h-4", isPinned && "fill-current")} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(activity.id); }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isStarred ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-500" : "text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                        )}
                        title={isStarred ? "Verwijder ster" : "Geef ster"}
                      >
                        <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                      </button>
                    </div>
                  </div>
                  
                  <p className={cn(
                    "text-sm text-stone-600 dark:text-stone-400 mb-5 leading-relaxed transition-all duration-300",
                    expandedActivityId === activity.id ? "" : "line-clamp-2"
                  )}>
                    {activity.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 mb-4">
                    <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-md capitalize border border-stone-200/50 dark:border-stone-700/50">{activity.category}</span>
                    <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-md border border-stone-200/50 dark:border-stone-700/50">{activity.region}</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 dark:bg-stone-800/50 rounded-md border border-stone-200/50 dark:border-stone-700/50">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {activity.daysNeeded} dagen
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 dark:bg-stone-800/50 rounded-md border border-stone-200/50 dark:border-stone-700/50">
                      <DollarSign className="w-3.5 h-3.5 text-stone-400" /> 
                      {activity.costRange[0] === 0 && activity.costRange[1] === 0 
                        ? 'Gratis' 
                        : `€${activity.costRange[0]} - €${activity.costRange[1]}`}
                    </span>
                  </div>
                  
                  {activity.tip && expandedActivityId !== activity.id && (
                    <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-800 dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/20">
                      <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
                      <p className="line-clamp-1 leading-relaxed">{activity.tip}</p>
                    </div>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedActivityId === activity.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                          {activity.photoUrl && (
                            <img 
                              src={activity.photoUrl} 
                              alt={activity.title} 
                              className="w-full h-48 object-cover rounded-xl"
                            />
                          )}
                          
                          {activity.tip && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30 leading-relaxed">
                              <Info className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
                              <p>{activity.tip}</p>
                            </div>
                          )}

                          {activity.links && Object.keys(activity.links).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm">Handige links</h4>
                              <div className="flex flex-col gap-2">
                                {Object.entries(activity.links).map(([key, url]) => (
                                  <a 
                                    key={key} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    {key === 'book' ? 'Boeken' : key === 'info' ? 'Meer info' : 'Kaart'}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Geen activiteiten gevonden met deze filters.</p>
              <button 
                onClick={() => { 
                  setSearchTerm(''); 
                  setFilters({ category: null, priority: null, minDays: null, maxCost: null }); 
                }}
                className="mt-4 text-orange-600 dark:text-orange-400 font-medium hover:underline"
              >
                Wis filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className="hidden md:block w-1/2 lg:w-7/12 h-full">
        <MapView 
          activities={filteredActivities} 
          showAll={true} 
          selectedActivityId={expandedActivityId || undefined}
          onMarkerClick={(id) => {
            setExpandedActivityId(id);
            setTimeout(() => {
              document.getElementById(`activity-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
          onInfoClick={(id) => {
            setExpandedActivityId(id);
            setTimeout(() => {
              document.getElementById(`activity-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
          onClearSelection={() => setExpandedActivityId(null)}
        />
      </div>
    </div>
  );
}
