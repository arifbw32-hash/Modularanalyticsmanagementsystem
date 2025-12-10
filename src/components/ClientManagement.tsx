import { useState } from 'react';
import { Client, Sector } from '../types';
import { Pencil, Trash2, Plus, Settings, Search } from 'lucide-react';

interface ClientManagementProps {
  clients: Client[];
  sectors: Sector[];
  onAdd: (client: Client) => void;
  onUpdate: (clientId: string, updates: Partial<Client>) => void;
  onDelete: (clientId: string) => void;
  onManageModules: (clientId: string) => void;
}

export function ClientManagement({ 
  clients,
  sectors,
  onAdd, 
  onUpdate, 
  onDelete,
  onManageModules 
}: ClientManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    project_id: 0,
    category: '',
    sector_id: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      onUpdate(editingClient.client_id, {
        name: formData.name,
        project_id: formData.project_id,
        category: formData.category,
        sector_id: formData.sector_id
      });
    } else {
      const newClient: Client = {
        client_id: formData.client_id,
        name: formData.name,
        project_id: formData.project_id,
        category: formData.category,
        sector_id: formData.sector_id,
        modules: {}
      };
      onAdd(newClient);
    }
    
    closeModal();
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        client_id: client.client_id,
        name: client.name,
        project_id: client.project_id,
        category: client.category || '',
        sector_id: client.sector_id || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ client_id: '', name: '', project_id: 0, category: '', sector_id: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ client_id: '', name: '', project_id: 0, category: '', sector_id: '' });
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.client_id.toLowerCase().includes(query) ||
      client.name.toLowerCase().includes(query) ||
      client.category?.toLowerCase().includes(query) ||
      client.project_id.toString().includes(query)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="mb-2">Client Management</h1>
          <p className="text-gray-600">Manage your clients and their analytics modules</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client ID, name, category, or project ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Client ID</th>
              <th className="px-6 py-3 text-left text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-gray-700">Project ID</th>
              <th className="px-6 py-3 text-left text-gray-700">Modules</th>
              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No clients found. Add your first client to get started.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.client_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{client.client_id}</td>
                  <td className="px-6 py-4">{client.name}</td>
                  <td className="px-6 py-4">
                    {client.category && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {client.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{client.project_id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {Object.keys(client.modules).length} assigned
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onManageModules(client.client_id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                        title="Manage Modules"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(client)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete client "${client.name}"?`)) {
                            onDelete(client.client_id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingClient}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Project ID
                </label>
                <input
                  type="number"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={formData.sector_id}
                  onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a sector</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}