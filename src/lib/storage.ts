import { AppState, Client, MasterModule } from '../types';

const STORAGE_KEY = 'analytics_management_system';

const defaultState: AppState = {
  clients: [],
  masterModules: []
};

export const storage = {
  load(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : defaultState;
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultState;
    }
  },

  save(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  export(): string {
    const state = this.load();
    return JSON.stringify(state, null, 2);
  },

  import(jsonString: string): boolean {
    try {
      const state = JSON.parse(jsonString);
      this.save(state);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
