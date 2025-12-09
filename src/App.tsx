import { useState, useEffect } from 'react';
import { Client, MasterModule, ModuleInstance, AppState } from './types';
import { storage } from './lib/storage';
import { ClientManagement } from './components/ClientManagement';
import { MasterModuleManagement } from './components/MasterModuleManagement';
import { ModuleAssignment } from './components/ModuleAssignment';
import { ModuleConfiguration } from './components/ModuleConfiguration';
import { DebugExport } from './components/DebugExport';
import { Users, Package, Database } from 'lucide-react';

type View = 
  | { type: 'clients' }
  | { type: 'modules' }
  | { type: 'assignment'; clientId: string }
  | { type: 'configuration'; clientId: string; moduleId: string }
  | { type: 'debug' };

export default function App() {
  const [state, setState] = useState<AppState>(() => storage.load());
  const [currentView, setCurrentView] = useState<View>({ type: 'clients' });

  // Save to localStorage whenever state changes
  useEffect(() => {
    storage.save(state);
  }, [state]);

  // Client operations
  const addClient = (client: Client) => {
    setState(prev => ({
      ...prev,
      clients: [...prev.clients, client]
    }));
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => 
        c.client_id === clientId ? { ...c, ...updates } : c
      )
    }));
  };

  const deleteClient = (clientId: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.client_id !== clientId)
    }));
  };

  // Module operations
  const addModule = (module: MasterModule) => {
    setState(prev => ({
      ...prev,
      masterModules: [...prev.masterModules, module]
    }));
  };

  const updateModule = (moduleId: number, updates: Partial<MasterModule>) => {
    setState(prev => ({
      ...prev,
      masterModules: prev.masterModules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      )
    }));
  };

  const deleteModule = (moduleId: number) => {
    setState(prev => {
      // Also remove from all clients
      const updatedClients = prev.clients.map(client => {
        const { [moduleId.toString()]: removed, ...remainingModules } = client.modules;
        return { ...client, modules: remainingModules };
      });

      return {
        ...prev,
        masterModules: prev.masterModules.filter(m => m.id !== moduleId),
        clients: updatedClients
      };
    });
  };

  // Module assignment operations
  const assignModule = (clientId: string, moduleId: string) => {
    setState(prev => {
      const module = prev.masterModules.find(m => m.id.toString() === moduleId);
      if (!module) return prev;

      // Initialize config values with defaults
      const configValues: Record<string, any> = {};
      module.config_schema.forEach(field => {
        configValues[field.id] = field.default;
      });

      const moduleInstance: ModuleInstance = {
        is_active: false,
        prompt: '',
        config_values: configValues
      };

      return {
        ...prev,
        clients: prev.clients.map(c =>
          c.client_id === clientId
            ? { ...c, modules: { ...c.modules, [moduleId]: moduleInstance } }
            : c
        )
      };
    });
  };

  const unassignModule = (clientId: string, moduleId: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => {
        if (c.client_id === clientId) {
          const { [moduleId]: removed, ...remainingModules } = c.modules;
          return { ...c, modules: remainingModules };
        }
        return c;
      })
    }));
  };

  const toggleModuleActive = (clientId: string, moduleId: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => {
        if (c.client_id === clientId && c.modules[moduleId]) {
          return {
            ...c,
            modules: {
              ...c.modules,
              [moduleId]: {
                ...c.modules[moduleId],
                is_active: !c.modules[moduleId].is_active
              }
            }
          };
        }
        return c;
      })
    }));
  };

  const updateModulePrompt = (clientId: string, moduleId: string, prompt: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => {
        if (c.client_id === clientId && c.modules[moduleId]) {
          return {
            ...c,
            modules: {
              ...c.modules,
              [moduleId]: {
                ...c.modules[moduleId],
                prompt
              }
            }
          };
        }
        return c;
      })
    }));
  };

  const updateModuleConfig = (clientId: string, moduleId: string, configValues: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => {
        if (c.client_id === clientId && c.modules[moduleId]) {
          return {
            ...c,
            modules: {
              ...c.modules,
              [moduleId]: {
                ...c.modules[moduleId],
                config_values: configValues
              }
            }
          };
        }
        return c;
      })
    }));
    setCurrentView({ type: 'assignment', clientId });
  };

  // Data operations
  const handleExport = () => {
    return storage.export();
  };

  const handleImport = (jsonString: string) => {
    const success = storage.import(jsonString);
    if (success) {
      setState(storage.load());
    }
    return success;
  };

  const handleClear = () => {
    storage.clear();
    setState({ clients: [], masterModules: [] });
  };

  // Navigation
  const navigateToClients = () => setCurrentView({ type: 'clients' });
  const navigateToModules = () => setCurrentView({ type: 'modules' });
  const navigateToDebug = () => setCurrentView({ type: 'debug' });
  const navigateToAssignment = (clientId: string) => setCurrentView({ type: 'assignment', clientId });
  const navigateToConfiguration = (clientId: string, moduleId: string) => 
    setCurrentView({ type: 'configuration', clientId, moduleId });

  // Get current client and module for specific views
  const getCurrentClient = () => {
    if (currentView.type === 'assignment' || currentView.type === 'configuration') {
      return state.clients.find(c => c.client_id === currentView.clientId);
    }
    return undefined;
  };

  const getCurrentModule = () => {
    if (currentView.type === 'configuration') {
      return state.masterModules.find(m => m.id.toString() === currentView.moduleId);
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600">Modular Analytics Management System</h1>
            <div className="flex gap-2">
              <button
                onClick={navigateToClients}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  currentView.type === 'clients' || currentView.type === 'assignment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Clients
              </button>
              <button
                onClick={navigateToModules}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  currentView.type === 'modules'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Package className="w-4 h-4" />
                Master Modules
              </button>
              <button
                onClick={navigateToDebug}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  currentView.type === 'debug'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Database className="w-4 h-4" />
                Debug
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView.type === 'clients' && (
          <ClientManagement
            clients={state.clients}
            onAdd={addClient}
            onUpdate={updateClient}
            onDelete={deleteClient}
            onManageModules={navigateToAssignment}
          />
        )}

        {currentView.type === 'modules' && (
          <MasterModuleManagement
            modules={state.masterModules}
            onAdd={addModule}
            onUpdate={updateModule}
            onDelete={deleteModule}
          />
        )}

        {currentView.type === 'assignment' && getCurrentClient() && (
          <ModuleAssignment
            client={getCurrentClient()!}
            masterModules={state.masterModules}
            onAssignModule={assignModule}
            onUnassignModule={unassignModule}
            onToggleActive={toggleModuleActive}
            onUpdatePrompt={updateModulePrompt}
            onConfigureModule={navigateToConfiguration}
            onBack={navigateToClients}
          />
        )}

        {currentView.type === 'configuration' && getCurrentClient() && getCurrentModule() && (
          <ModuleConfiguration
            client={getCurrentClient()!}
            module={getCurrentModule()!}
            onSave={updateModuleConfig}
            onBack={() => navigateToAssignment(currentView.clientId)}
          />
        )}

        {currentView.type === 'debug' && (
          <DebugExport
            onExport={handleExport}
            onImport={handleImport}
            onClear={handleClear}
          />
        )}
      </main>
    </div>
  );
}