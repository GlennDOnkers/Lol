import { useState, useEffect } from 'react';
import { BrowseView } from './components/BrowseView';
import { StarsView } from './components/StarsView';
import { CalendarView } from './components/CalendarView';
import { BudgetView } from './components/BudgetView';
import { TipsView } from './components/TipsView';
import { GuideView } from './components/GuideView';
import { PackingListView } from './components/PackingListView';
import { AIPlannerView } from './components/AIPlannerView';
import { SettingsView } from './components/SettingsView';
import { OnboardingTour } from './components/OnboardingTour';
import { activities as defaultActivities } from './data/activities';
import { TabType } from './types';
import { Map, Search, Star, Calendar, DollarSign, Lightbulb, BookOpen, Briefcase, Moon, Sun, Sparkles, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');

  const { isDarkMode, toggleDarkMode, customActivities } = useAppStore();

  const allActivities = [...defaultActivities, ...customActivities];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const tabs = [
    { id: 'browse', label: 'Browse', icon: Search },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles },
    { id: 'stars', label: 'Sterren', icon: Star },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'packing', label: 'Inpaklijst', icon: Briefcase },
    { id: 'tips', label: 'Tips', icon: Lightbulb },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'settings', label: 'Instellingen', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200">
      <OnboardingTour />
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between py-4 lg:py-6 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Map className="w-6 h-6 lg:w-7 lg:h-7 text-orange-600 dark:text-orange-500" />
                </div>
                Amerika Trip Planner
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1 text-xs lg:text-sm font-medium">
                3 Weken Westkust VS • Interactieve Roadtrip Planner
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4">
              <nav className="flex space-x-1 lg:space-x-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl overflow-x-auto hide-scrollbar transition-colors duration-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        "relative flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium rounded-lg transition-all whitespace-nowrap focus:outline-none",
                        isActive ? "text-orange-700 dark:text-orange-400" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-white dark:bg-stone-700 shadow-sm rounded-lg"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                        <Icon className={cn("w-4 h-4", isActive ? "text-orange-500 dark:text-orange-400" : "text-stone-400 dark:text-stone-500")} />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
              
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'browse' && <BrowseView activities={allActivities} />}
            {activeTab === 'ai-planner' && <AIPlannerView activities={allActivities} />}
            {activeTab === 'stars' && <StarsView activities={allActivities} />}
            {activeTab === 'calendar' && <CalendarView activities={allActivities} />}
            {activeTab === 'budget' && <BudgetView activities={allActivities} />}
            {activeTab === 'packing' && <PackingListView />}
            {activeTab === 'tips' && <TipsView activities={allActivities} />}
            {activeTab === 'guide' && <GuideView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
