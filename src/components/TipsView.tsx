import { useState } from 'react';
import { Activity, Region } from '../types';
import { useAppStore } from '../store';
import { MapView } from './MapView';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import { Star, MapPin, Info, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TipsViewProps {
  activities: Activity[];
}

export function TipsView({ activities }: TipsViewProps) {
  const { starredIds, toggleStar } = useAppStore();
  const [activeTab, setActiveTab] = useState<'destinations' | 'general'>('destinations');
  const [selectedRegion, setSelectedRegion] = useState<Region>('Florida');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const regions: Region[] = ['Florida', 'Gulf', 'Texas', 'New Mexico', 'Arizona', 'Utah', 'Nevada', 'California', 'Northeast', 'Multi-region'];
  const regionActivities = activities.filter(a => a.region === selectedRegion);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Sub-tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-stone-200/50 dark:bg-stone-800 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('destinations')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'destinations' ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            )}
          >
            Per Bestemming
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'general' ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            )}
          >
            Algemene Tips
          </button>
        </div>
      </div>

      {activeTab === 'destinations' ? (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Regions & Activities */}
          <div className="w-full md:w-1/2 flex flex-col h-[calc(100vh-220px)] bg-white dark:bg-stone-800 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 overflow-x-auto hide-scrollbar">
              <div className="flex gap-2">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                      selectedRegion === region ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
              <h3 className="font-display font-semibold text-stone-900 dark:text-white text-xl mb-6 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Compass className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                </div>
                Tips voor {selectedRegion}
              </h3>
              
              {regionActivities.map(activity => {
                const isStarred = starredIds.includes(activity.id);
                return (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedActivity(activity)}
                    className="bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 rounded-2xl p-5 hover:border-orange-300 dark:hover:border-orange-500/50 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-display font-medium text-lg text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors pr-4 leading-tight">{activity.title}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(activity.id); }}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200 shrink-0",
                          isStarred ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 shadow-sm" : "text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-300"
                        )}
                      >
                        <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                      </button>
                    </div>
                    
                    {activity.tip && (
                      <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800/30">
                        <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{activity.tip}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {regionActivities.length === 0 && (
                <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
                  Geen activiteiten gevonden voor deze regio.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Map */}
          <div className="hidden md:block w-1/2 h-[calc(100vh-220px)]">
            <MapView activities={regionActivities} showAll={true} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              Nationale Parken Pas
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
              Als je van plan bent om 3 of meer Nationale Parken te bezoeken, koop dan de 'America the Beautiful' pas. Deze kost $80 en is een jaar geldig voor een auto inclusief alle inzittenden. Je kunt hem kopen bij de ingang van het eerste park dat je bezoekt.
            </p>
          </div>
          
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Info className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              ESTA en Visum
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
              Vergeet niet je ESTA (Electronic System for Travel Authorization) minimaal 72 uur voor vertrek aan te vragen via de officiële website van de Amerikaanse overheid. Print de bevestiging uit en neem deze mee.
            </p>
          </div>
          
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Star className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              Fooien (Tipping)
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
              In de VS is het gebruikelijk om 15% tot 20% fooi te geven in restaurants, aan taxichauffeurs en gidsen. Het bedienend personeel leeft voornamelijk van deze fooien.
            </p>
          </div>
        </div>
      )}

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
