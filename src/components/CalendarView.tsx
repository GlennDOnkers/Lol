import { useState } from 'react';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { addDays, format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Trash2, GripVertical, Clock, DollarSign, Check, MapPin, Printer, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  activities: Activity[];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return Math.round(R * c); // Distance in km
}

export function CalendarView({ activities }: CalendarViewProps) {
  const { starredIds, calendar, assignToDay, removeFromDay, moveActivity, dayTitles, setDayTitle, loadLoop1 } = useAppStore();
  const [startDate, setStartDate] = useState('2026-09-01');
  const [numDays, setNumDays] = useState(21);
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);
  const [draggedOverActivity, setDraggedOverActivity] = useState<string | null>(null);
  
  const starredActivities = activities.filter(a => starredIds.includes(a.id));
  
  // Generate days
  const days = Array.from({ length: numDays }).map((_, i) => {
    const date = addDays(parseISO(startDate), i);
    return {
      dateStr: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'EEEE d MMMM', { locale: nl }),
      dayNumber: i + 1,
    };
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
      {/* Left Panel: Available Activities */}
      <div className="w-full md:w-1/3 flex flex-col h-64 md:h-[calc(100vh-180px)] bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden md:sticky md:top-24 transition-colors duration-200">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 backdrop-blur-sm transition-colors duration-200">
          <h2 className="font-display font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-3 text-lg">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            Beschikbare Activiteiten
          </h2>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-2">Opgeslagen items om in te plannen</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {starredActivities.map(activity => {
            // Check if already scheduled
            const isScheduled = Object.values(calendar).some(dayActs => dayActs.includes(activity.id));
            
            return (
              <div 
                key={activity.id}
                className={cn(
                  "p-3 rounded-xl border text-sm transition-all",
                  isScheduled ? "bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 opacity-60" : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-700 cursor-grab active:cursor-grabbing"
                )}
                draggable={!isScheduled}
                onDragStart={(e) => {
                  e.dataTransfer.setData('activityId', activity.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {!isScheduled && <GripVertical className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 mt-0.5 hidden md:block" />}
                    <div>
                      <h4 className="font-display font-medium text-stone-800 dark:text-stone-200 leading-tight mb-1">{activity.title}</h4>
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{activity.daysNeeded} dagen • {activity.region}</span>
                    </div>
                  </div>
                  {!isScheduled && (
                    <div className="md:hidden">
                      <select 
                        className="text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1 py-1 text-stone-700 dark:text-stone-300 max-w-[80px]"
                        onChange={(e) => {
                          if (e.target.value) {
                            assignToDay(e.target.value, activity.id);
                            e.target.value = ""; // Reset
                          }
                        }}
                        value=""
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="" disabled>Plan in...</option>
                        {days.map(d => (
                          <option key={d.dateStr} value={d.dateStr}>{format(new Date(d.dateStr), 'd MMM')}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {isScheduled && <div className="mt-2 text-xs text-green-600 dark:text-green-500 font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Ingepland</div>}
              </div>
            );
          })}
          
          {starredActivities.length === 0 && (
            <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
              Geen opgeslagen activiteiten. Ga naar Browse om er toe te voegen.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Calendar Days */}
      <div className="w-full md:w-2/3 space-y-6">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 print:hidden transition-colors duration-200">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Startdatum</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Aantal Dagen</label>
              <input 
                type="number" 
                min="1" max="60"
                value={numDays}
                onChange={(e) => setNumDays(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadLoop1}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-2"
            >
              <Route className="w-4 h-4" />
              Laad "Loop 1"
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day) => {
            const dayActivities = calendar[day.dateStr] || [];
            
            return (
              <div 
                key={day.dateStr}
                className={cn(
                  "bg-white dark:bg-stone-900 rounded-2xl shadow-sm border overflow-hidden transition-colors duration-200",
                  draggedOverDate === day.dateStr ? "border-orange-500 dark:border-orange-500 bg-orange-50/30 dark:bg-orange-900/20" : "border-stone-200 dark:border-stone-800"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedOverDate !== day.dateStr) {
                    setDraggedOverDate(day.dateStr);
                  }
                }}
                onDragLeave={() => {
                  setDraggedOverDate(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOverDate(null);
                  setDraggedOverActivity(null);
                  const activityId = e.dataTransfer.getData('activityId');
                  const sourceDate = e.dataTransfer.getData('sourceDate');
                  
                  if (activityId) {
                    if (sourceDate) {
                      moveActivity(sourceDate, day.dateStr, activityId);
                    } else {
                      assignToDay(day.dateStr, activityId);
                    }
                  }
                }}
              >
                <div className="p-4 bg-stone-50/80 dark:bg-stone-800/80 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4 transition-colors duration-200">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-700 dark:text-orange-400 font-bold shrink-0 shadow-sm border border-orange-200/50 dark:border-orange-800/30">
                      <span className="text-[10px] uppercase tracking-wider opacity-80 leading-none font-medium">Dag</span>
                      <span className="text-lg leading-none mt-1 font-display">{day.dayNumber}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-stone-800 dark:text-stone-200 capitalize text-base leading-tight mb-0.5">{day.displayDate}</h3>
                      <input 
                        type="text"
                        placeholder="Naam voor deze dag (bijv. Reisdag)"
                        value={dayTitles[day.dateStr] || ''}
                        onChange={(e) => setDayTitle(day.dateStr, e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-stone-500 dark:text-stone-400 focus:ring-0 placeholder-stone-300 dark:placeholder-stone-600 print:hidden"
                      />
                      {dayTitles[day.dateStr] && <p className="hidden print:block text-sm font-medium text-stone-500 dark:text-stone-400">{dayTitles[day.dateStr]}</p>}
                    </div>
                  </div>
                  
                  {/* Daily Summary */}
                  {dayActivities.length > 0 && (
                    <div className="flex gap-3 text-xs font-medium text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {dayActivities.reduce((sum, id) => sum + (activities.find(a => a.id === id)?.daysNeeded || 0), 0)} d
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        €{dayActivities.reduce((sum, id) => sum + (activities.find(a => a.id === id)?.costRange[0] || 0), 0)} - 
                        €{dayActivities.reduce((sum, id) => sum + (activities.find(a => a.id === id)?.costRange[1] || 0), 0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 min-h-[80px]">
                  {dayActivities.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-stone-400 dark:text-stone-500 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl py-4">
                      Sleep activiteiten hierheen
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {dayActivities.map((actId, index) => {
                          const activity = activities.find(a => a.id === actId);
                          if (!activity) return null;
                          
                          let distance = 0;
                          if (index > 0) {
                            const prevActId = dayActivities[index - 1];
                            const prevActivity = activities.find(a => a.id === prevActId);
                            if (prevActivity) {
                              distance = calculateDistance(prevActivity.lat, prevActivity.lng, activity.lat, activity.lng);
                            }
                          }
                          
                          return (
                            <div key={actId}>
                              {draggedOverActivity === actId && (
                                <div className="h-1.5 bg-orange-400 dark:bg-orange-600 rounded-full mb-2 mx-2 animate-pulse"></div>
                              )}
                              {distance > 0 && (
                                <div className="flex items-center gap-2 py-1 px-4 text-xs text-stone-400 dark:text-stone-500 font-medium">
                                  <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 ml-2"></div>
                                  <MapPin className="w-3 h-3" />
                                  {distance} km rijden
                                </div>
                              )}
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              draggable
                              onDragStart={(e: any) => {
                                e.dataTransfer.setData('activityId', actId);
                                e.dataTransfer.setData('sourceDate', day.dateStr);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedOverActivity !== actId) {
                                  setDraggedOverActivity(actId);
                                }
                              }}
                              onDragLeave={() => {
                                setDraggedOverActivity(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDraggedOverActivity(null);
                                setDraggedOverDate(null);
                                const activityId = e.dataTransfer.getData('activityId');
                                const sourceDate = e.dataTransfer.getData('sourceDate');
                                const destIndex = dayActivities.indexOf(actId);
                                
                                if (activityId && activityId !== actId) {
                                  if (sourceDate) {
                                    moveActivity(sourceDate, day.dateStr, activityId, destIndex);
                                  } else {
                                    assignToDay(day.dateStr, activityId, destIndex);
                                  }
                                }
                              }}
                              className="flex flex-col gap-2 p-3 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 shadow-sm rounded-xl cursor-grab active:cursor-grabbing hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 print:hidden hidden md:block group-hover:text-orange-400 transition-colors" />
                                  <div>
                                    <h4 className="font-display font-medium text-stone-800 dark:text-stone-200 text-sm leading-tight mb-0.5">{activity.title}</h4>
                                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{activity.category} • {activity.daysNeeded} dagen</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="md:hidden">
                                    <select 
                                      className="text-xs bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded px-1 py-1 text-orange-800 dark:text-orange-300 max-w-[80px]"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          moveActivity(day.dateStr, e.target.value, actId);
                                          e.target.value = ""; // Reset
                                        }
                                      }}
                                      value=""
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <option value="" disabled>Verplaats...</option>
                                      {days.map(d => (
                                        <option key={d.dateStr} value={d.dateStr}>{format(new Date(d.dateStr), 'd MMM')}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <button 
                                    onClick={() => removeFromDay(day.dateStr, actId)}
                                    className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors print:hidden opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <ActivityNote actId={actId} />
                            </motion.div>
                            </div>
                          );
                        })}
                      </AnimatePresence>
                      {dayActivities.length > 0 && draggedOverDate === day.dateStr && draggedOverActivity === null && (
                        <div className="h-1.5 bg-orange-400 dark:bg-orange-600 rounded-full mt-2 mx-2 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityNote({ actId }: { actId: string }) {
  const note = useAppStore(state => state.activityNotes[actId]) || '';
  const setActivityNote = useAppStore(state => state.setActivityNote);

  return (
    <div className="pl-7 pr-2">
      <textarea
        placeholder="Notities voor deze activiteit (bijv. reserveringsnummer, tijdstip)"
        value={note}
        onChange={(e) => setActivityNote(actId, e.target.value)}
        className="w-full text-xs bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 text-stone-700 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 resize-none print:hidden transition-all"
        rows={2}
      />
      {note && (
        <p className="hidden print:block text-xs text-stone-600 dark:text-stone-400 italic mt-1">
          {note}
        </p>
      )}
    </div>
  );
}
