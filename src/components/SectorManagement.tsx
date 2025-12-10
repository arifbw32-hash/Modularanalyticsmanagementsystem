import { useState } from 'react';
import { Sector } from '../types';
import { Pencil, Trash2, Plus, Settings, Search } from 'lucide-react';

interface SectorManagementProps {
  sectors: Sector[];
  onAdd: (sector: Sector) => void;
  onUpdate: (sectorId: string, updates: Partial<Sector>) => void;
  onDelete: (sectorId: string) => void;
  onManageModules: (sectorId: string) => void;
}

export function SectorManagement({
  sectors,
  onAdd,
  onUpdate,
  onDelete,
  onManageModules
}: SectorManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSector) {
      onUpdate(editingSector.id, {
        name: formData.name,
        description: formData.description
      });
    } else {
      const newSector: Sector = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        modules: {}
      };
      onAdd(newSector);
    }
    
    closeModal();
  };

  const openModal = (sector?: Sector) => {
    if (sector) {
      setEditingSector(sector);
      setFormData({
        id: sector.id,
        name: sector.name,
        description: sector.description
      });
    } else {
      setEditingSector(null);
      setFormData({ id: '', name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSector(null);
    setFormData({ id: '', name: '', description: '' });
  };

  // Filter sectors based on search query
  const filteredSectors = sectors.filter(sector => {
    const query = searchQuery.toLowerCase();
    return (
      sector.id.toLowerCase().includes(query) ||
      sector.name.toLowerCase().includes(query) ||
      sector.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Sector Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage sectors and their default module configurations (Level 1 Config)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sector
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by sector ID, name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Found {filteredSectors.length} sector{filteredSectors.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Sector ID</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Modules</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSectors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No sectors found. Add your first sector to get started.
                </td>
              </tr>
            ) : (
              filteredSectors.map((sector) => (
                <tr key={sector.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{sector.id}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{sector.name}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{sector.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-2 py-1 rounded">
                      {Object.keys(sector.modules).length} assigned
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onManageModules(sector.id)}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                        title="Manage Modules"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(sector)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete sector "${sector.name}"? This will not affect existing clients.`)) {
                            onDelete(sector.id);
                          }
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h2 className="mb-4 text-gray-900 dark:text-white">
              {editingSector ? 'Edit Sector' : 'Add New Sector'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Sector ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  disabled={!!editingSector}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSector ? 'Update' : 'Add'} Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
