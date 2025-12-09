// Type definitions for the Modular Analytics Management System

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select';

export interface ConfigSchemaField {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];  // only for select
  default: any;
}

export interface MasterModule {
  id: number;
  name: string;
  query_name: string;
  tab: string;
  metrics: string[];
  description: string;
  config_schema: ConfigSchemaField[];
}

export interface ModuleInstance {
  is_active: boolean;
  prompt: string;
  config_values: Record<string, any>;
}

export interface Client {
  client_id: string;
  name: string;
  project_id: number;
  category: string;
  modules: Record<string, ModuleInstance>;
}

export interface AppState {
  clients: Client[];
  masterModules: MasterModule[];
}