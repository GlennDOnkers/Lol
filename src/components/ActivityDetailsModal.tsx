import { motion, AnimatePresence } from 'motion/react';
import { Activity } from '../types';
import { X, MapPin, Star, Clock, DollarSign, Info, ExternalLink, Map, BookOpen } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

interface ActivityDetailsModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export function ActivityDetailsModal({ activity, onClose }: ActivityDetailsModalProps) {
  const { starredIds, pinnedIds, toggleStar, togglePin } = useAppStore();

  if (!activity) return null;

  const isStarred = starredIds.includes(activity.id);
  const isPinned = pinnedIds.includes(activity.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-stone-900 shadow-2xl overflow-hidden flex flex-col z-10 transition-colors duration-200"
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 bg-stone-200 dark:bg-stone-800 shrink-0">
            {activity.photoUrl ? (
              <img 
                src={activity.photoUrl} 
                alt={activity.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600">
                <MapPin className="w-12 h-12 opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-lg capitalize">
                    {activity.category}
                  </span>
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-lg">
                    {activity.region}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                  {activity.title}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(activity.id); }}
                  className={cn(
                    "p-2.5 rounded-full backdrop-blur-md transition-colors",
                    isPinned ? "bg-orange-500 text-white" : "bg-white/20 text-white hover:bg-white/40"
                  )}
                  title={isPinned ? "Verwijder pin" : "Pin op kaart"}
                >
                  <MapPin className={cn("w-5 h-5", isPinned && "fill-current")} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(activity.id); }}
                  className={cn(
                    "p-2.5 rounded-full backdrop-blur-md transition-colors",
                    isStarred ? "bg-yellow-400 text-yellow-900" : "bg-white/20 text-white hover:bg-white/40"
                  )}
                  title={isStarred ? "Verwijder ster" : "Geef ster"}
                >
                  <Star className={cn("w-5 h-5", isStarred && "fill-current")} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto hide-scrollbar">
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500 dark:text-stone-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">Tijd nodig</p>
                  <p className="font-medium">{activity.daysNeeded} {activity.daysNeeded === 1 ? 'dag' : 'dagen'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500 dark:text-stone-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">Kosten</p>
                  <p className="font-medium">
                    {activity.costRange[0] === 0 && activity.costRange[1] === 0 
                      ? 'Gratis' 
                      : `€${activity.costRange[0]} - €${activity.costRange[1]}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                  Over deze activiteit
                </h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[15px]">{activity.description}</p>
              </div>

              {activity.tip && (
                <div className="p-5 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex gap-4 shadow-sm">
                  <Info className="w-6 h-6 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display font-semibold text-blue-900 dark:text-blue-300 mb-1.5">Tip van de expert</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed">{activity.tip}</p>
                  </div>
                </div>
              )}

              {activity.links && Object.keys(activity.links).length > 0 && (
                <div>
                  <h3 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                    Handige links
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {activity.links.info && (
                      <a 
                        href={activity.links.info} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4 text-stone-500 dark:text-stone-400" /> Meer info
                      </a>
                    )}
                    {activity.links.book && (
                      <a 
                        href={activity.links.book} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-500" /> Boeken
                      </a>
                    )}
                    {activity.links.maps && (
                      <a 
                        href={activity.links.maps} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Bekijk op kaart
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
