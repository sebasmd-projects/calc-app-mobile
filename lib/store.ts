import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  expression: string;
  latex: string;
  result: string;
  timestamp: number;
}

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Language
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  
  // Auth
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  keepSignedIn: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  setKeepSignedIn: (value: boolean) => void;
  
  // Calculator
  angleUnit: 'rad' | 'deg';
  setAngleUnit: (unit: 'rad' | 'deg') => void;
  toggleAngleUnit: () => void;
  
  // History
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  
  // Drawer
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      
      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      // Auth
      isAuthenticated: false,
      user: null,
      keepSignedIn: false,
      login: (email, name = '') => set({ 
        isAuthenticated: true, 
        user: { email, name: name || email.split('@')[0] } 
      }),
      logout: () => set({ 
        isAuthenticated: false, 
        user: null,
        ...(get().keepSignedIn ? {} : { history: [] })
      }),
      setKeepSignedIn: (keepSignedIn) => set({ keepSignedIn }),
      
      // Calculator
      angleUnit: 'rad',
      setAngleUnit: (angleUnit) => set({ angleUnit }),
      toggleAngleUnit: () => set((state) => ({ 
        angleUnit: state.angleUnit === 'rad' ? 'deg' : 'rad' 
      })),
      
      // History
      history: [],
      addToHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 100), // Keep last 100 items
      })),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      })),
      
      // Drawer
      isDrawerOpen: false,
      setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
    }),
    {
      name: 'calcpro-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isAuthenticated: state.keepSignedIn ? state.isAuthenticated : false,
        user: state.keepSignedIn ? state.user : null,
        keepSignedIn: state.keepSignedIn,
        angleUnit: state.angleUnit,
        history: state.history,
      }),
    }
  )
);
