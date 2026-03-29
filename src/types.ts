export type Category = 'adventure' | 'nature' | 'culture' | 'events' | 'parks' | 'routes' | 'wellbeing' | 'social';
export type Region = 'Florida' | 'Gulf' | 'Texas' | 'New Mexico' | 'Arizona' | 'Utah' | 'Nevada' | 'California' | 'Northeast' | 'Multi-region';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Activity {
  id: string;
  title: string;
  description: string;
  tip?: string;
  costRange: [number, number];
  daysNeeded: number;
  category: Category;
  region: Region;
  priority: Priority;
  lat: number;
  lng: number;
  links?: {
    book?: string;
    info?: string;
    maps?: string;
  };
  photoUrl?: string;
}

export interface CustomAnnotation {
  id: string;
  type: 'marker' | 'polyline' | 'polygon';
  latlngs: [number, number] | [number, number][] | [number, number][][];
  title?: string;
}

export interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'Kleding' | 'Elektronica' | 'Documenten' | 'Diversen';
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  activityIds: string[];
  notes: string;
}

export interface BudgetSettings {
  dailyFood: number;
  transport: number;
  package: number;
  customCategories?: { id: string; name: string; amount: number }[];
}

export type TabType = 'browse' | 'stars' | 'calendar' | 'budget' | 'tips' | 'guide' | 'packing' | 'ai-planner' | 'settings';
