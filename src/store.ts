import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetSettings, CustomAnnotation, Activity, PackingItem } from './types';

interface Filters {
  category: string | null;
  priority: string | null;
  minDays: number | null;
  maxCost: number | null;
}

interface AppState {
  starredIds: string[];
  pinnedIds: string[];
  bookingStatus: Record<string, boolean>;
  calendar: Record<string, string[]>; // date (YYYY-MM-DD) -> array of activity IDs
  budgetSettings: BudgetSettings;
  customAnnotations: CustomAnnotation[];
  
  // New state for features
  customActivities: Activity[];
  dayTitles: Record<string, string>;
  activityNotes: Record<string, string>;
  paidActivities: Record<string, boolean>;
  currency: 'EUR' | 'USD';
  packingList: PackingItem[];
  isDarkMode: boolean;
  activityTags: Record<string, string[]>;
  filters: Filters;
  
  toggleStar: (id: string) => void;
  togglePin: (id: string) => void;
  toggleBooking: (id: string) => void;
  assignToDay: (date: string, id: string, index?: number) => void;
  removeFromDay: (date: string, id: string) => void;
  moveActivity: (sourceDate: string, destDate: string, activityId: string, destIndex?: number) => void;
  updateBudget: (settings: Partial<BudgetSettings>) => void;
  addAnnotation: (annotation: CustomAnnotation) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, annotation: Partial<CustomAnnotation>) => void;

  // New actions
  addCustomActivity: (activity: Activity) => void;
  setDayTitle: (date: string, title: string) => void;
  setActivityNote: (id: string, note: string) => void;
  togglePaidActivity: (id: string) => void;
  setCurrency: (currency: 'EUR' | 'USD') => void;
  addPackingItem: (item: PackingItem) => void;
  togglePackingItem: (id: string) => void;
  removePackingItem: (id: string) => void;
  toggleDarkMode: () => void;
  importState: (state: Partial<AppState>) => void;
  loadLoop1: () => void;
  toggleTag: (activityId: string, tag: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  // AI Co-Pilot State
  aiScenarios: AIScenario[];
  activeScenarioId: string | null;
  aiMessages: Message[];
  showAiScenariosPanel: boolean;
  setAIScenarios: (scenarios: AIScenario[]) => void;
  setActiveScenario: (id: string | null) => void;
  setShowAiScenariosPanel: (show: boolean) => void;
  updateScenarioRoute: (id: string, routeCoordinates: [number, number][], distance?: number, duration?: number) => void;
  setAiMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;

  // Settings
  aiModel: string;
  anthropicApiKey: string;
  setAiModel: (model: string) => void;
  setAnthropicApiKey: (key: string) => void;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface AIScenario {
  id: string;
  name: string;
  description: string;
  color: string;
  transportMode: 'driving' | 'flying' | 'walking';
  waypoints: { name: string; lat: number; lng: number }[];
  routeCoordinates?: [number, number][];
  distance?: number;
  duration?: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      starredIds: [],
      pinnedIds: [],
      bookingStatus: {},
      calendar: {},
      customAnnotations: [],
      customActivities: [],
      dayTitles: {},
      activityNotes: {},
      paidActivities: {},
      currency: 'EUR',
      packingList: [
        { id: '1', text: 'Paspoort & ESTA', checked: false, category: 'Documenten' },
        { id: '2', text: 'Rijbewijs & Creditcard', checked: false, category: 'Documenten' },
        { id: '3', text: 'Wandelschoenen', checked: false, category: 'Kleding' },
        { id: '4', text: 'Wereldstekker', checked: false, category: 'Elektronica' },
      ],
      isDarkMode: false,
      activityTags: {},
      filters: {
        category: null,
        priority: null,
        minDays: null,
        maxCost: null,
      },
      aiScenarios: [],
      activeScenarioId: null,
      showAiScenariosPanel: false,
      aiMessages: [
        {
          id: 'welcome',
          role: 'model',
          text: 'Hallo! Ik ben je AI Reisplanner. Ik zie dat je een aantal activiteiten een ster hebt gegeven. Hoe kan ik je helpen met het plannen van je roadtrip? Ik kan routes voorstellen, een dagplanning maken, of tips geven over reistijden.',
        }
      ],
      aiModel: 'gemini-3-flash-preview',
      anthropicApiKey: '',
      budgetSettings: {
        dailyFood: 100,
        transport: 1500,
        package: 2000,
        customCategories: [],
      },

      setAiModel: (model) => set({ aiModel: model }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

      toggleStar: (id) =>
        set((state) => ({
          starredIds: state.starredIds.includes(id)
            ? state.starredIds.filter((i) => i !== id)
            : [...state.starredIds, id],
        })),

      togglePin: (id) =>
        set((state) => ({
          pinnedIds: state.pinnedIds.includes(id)
            ? state.pinnedIds.filter((i) => i !== id)
            : [...state.pinnedIds, id],
        })),

      toggleBooking: (id) =>
        set((state) => ({
          bookingStatus: {
            ...state.bookingStatus,
            [id]: !state.bookingStatus[id],
          },
        })),

      assignToDay: (date, id, index) =>
        set((state) => {
          const dayActivities = [...(state.calendar[date] || [])];
          if (dayActivities.includes(id)) return state;
          
          if (index !== undefined) {
            dayActivities.splice(index, 0, id);
          } else {
            dayActivities.push(id);
          }
          
          return {
            calendar: {
              ...state.calendar,
              [date]: dayActivities,
            },
          };
        }),

      removeFromDay: (date, id) =>
        set((state) => {
          const dayActivities = state.calendar[date] || [];
          return {
            calendar: {
              ...state.calendar,
              [date]: dayActivities.filter((i) => i !== id),
            },
          };
        }),

      moveActivity: (sourceDate, destDate, activityId, destIndex) =>
        set((state) => {
          const sourceActivities = [...(state.calendar[sourceDate] || [])];
          const destActivities = sourceDate === destDate 
            ? sourceActivities 
            : [...(state.calendar[destDate] || [])];

          // Remove from source
          const sourceIndex = sourceActivities.indexOf(activityId);
          if (sourceIndex > -1) {
            sourceActivities.splice(sourceIndex, 1);
          }

          // Add to dest
          if (destIndex !== undefined) {
            destActivities.splice(destIndex, 0, activityId);
          } else {
            destActivities.push(activityId);
          }

          return {
            calendar: {
              ...state.calendar,
              [sourceDate]: sourceActivities,
              [destDate]: destActivities,
            },
          };
        }),

      updateBudget: (settings) =>
        set((state) => ({
          budgetSettings: { ...state.budgetSettings, ...settings },
        })),

      addAnnotation: (annotation) =>
        set((state) => ({
          customAnnotations: [...state.customAnnotations, annotation],
        })),

      removeAnnotation: (id) =>
        set((state) => ({
          customAnnotations: state.customAnnotations.filter((a) => a.id !== id),
        })),

      updateAnnotation: (id, annotation) =>
        set((state) => ({
          customAnnotations: state.customAnnotations.map((a) =>
            a.id === id ? { ...a, ...annotation } : a
          ),
        })),

      // New action implementations
      addCustomActivity: (activity) => set((state) => ({ customActivities: [...state.customActivities, activity] })),
      setDayTitle: (date, title) => set((state) => ({ dayTitles: { ...state.dayTitles, [date]: title } })),
      setActivityNote: (id, note) => set((state) => ({ activityNotes: { ...state.activityNotes, [id]: note } })),
      togglePaidActivity: (id) => set((state) => ({ paidActivities: { ...state.paidActivities, [id]: !state.paidActivities[id] } })),
      setCurrency: (currency) => set({ currency }),
      addPackingItem: (item) => set((state) => ({ packingList: [...state.packingList, item] })),
      togglePackingItem: (id) => set((state) => ({
        packingList: state.packingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
      })),
      removePackingItem: (id) => set((state) => ({ packingList: state.packingList.filter(item => item.id !== id) })),
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { isDarkMode: newMode };
      }),
      importState: (newState) => set((state) => ({ ...state, ...newState })),
      loadLoop1: () => set((state) => {
        // Grand Circle Loop 1
        const loop1 = {
          '2026-06-01': ['act-1', 'act-28'], // Vegas
          '2026-06-02': ['act-4', 'act-5'], // Zion
          '2026-06-03': ['act-6'], // Bryce
          '2026-06-04': ['act-7', 'act-8'], // Page (Antelope, Horseshoe)
          '2026-06-05': ['act-23'], // Monument Valley
          '2026-06-06': ['act-22', 'act-9'], // Grand Canyon
          '2026-06-07': ['act-25'], // Sedona
        };
        return { calendar: { ...state.calendar, ...loop1 } };
      }),
      toggleTag: (activityId, tag) => set((state) => {
        const tags = state.activityTags[activityId] || [];
        const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
        return { activityTags: { ...state.activityTags, [activityId]: newTags } };
      }),
      setAIScenarios: (scenarios) => set({ aiScenarios: scenarios }),
      setActiveScenario: (id) => set({ activeScenarioId: id }),
      setShowAiScenariosPanel: (show) => set({ showAiScenariosPanel: show }),
      setAiMessages: (messages) => set((state) => ({ 
        aiMessages: typeof messages === 'function' ? messages(state.aiMessages) : messages 
      })),
      updateScenarioRoute: (id, routeCoordinates, distance, duration) => set((state) => ({
        aiScenarios: state.aiScenarios.map(s => 
          s.id === id ? { ...s, routeCoordinates, distance, duration } : s
        )
      })),
    }),
    {
      name: 'amerika-trip-planner-storage',
    }
  )
);
