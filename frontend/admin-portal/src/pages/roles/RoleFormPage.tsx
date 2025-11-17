import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rolesApi } from '../../services/api';
import type { CreateRoleDto, UpdateRoleDto, Role } from '../../types';

export const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [newPermission, setNewPermission] = useState('');

  useEffect(() => {
    const loadRole = async (roleId: string) => {
      try {
        setLoading(true);
        const role = await rolesApi.getById(roleId);

        setFormData({
          name: role.name,
          description: role.description || '',
        });
        setPermissions(role.permissions);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load role');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRole(id);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const roleData: CreateRoleDto | UpdateRoleDto = {
        name: formData.name,
        description: formData.description || undefined,
        permissions,
      };

      if (id) {
        await rolesApi.update(id, roleData);
      } else {
        await rolesApi.create(roleData as CreateRoleDto);
      }

      navigate('/roles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = () => {
    if (newPermission && !permissions[newPermission]) {
      setPermissions({ ...permissions, [newPermission]: true });
      setNewPermission('');
    }
  };

  const handleRemovePermission = (permission: string) => {
    const newPerms = { ...permissions };
    delete newPerms[permission];
    setPermissions(newPerms);
  };

  const suggestedPermissions = [
    'users:read',
    'users:write',
    'users:delete',
    'users:list',
    'roles:read',
    'roles:write',
    'roles:delete',
    'roles:list',
  ];

  if (loading && id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {id ? 'Edit Role' : 'Create New Role'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Permissions
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., users:read"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPermission())}
              />
              <button
                type="button"
                onClick={handleAddPermission}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Suggested permissions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPermissions.map((perm) => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => {
                      if (!permissions[perm]) {
                        setPermissions({ ...permissions, [perm]: true });
                      }
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    disabled={!!permissions[perm]}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-300 rounded-md p-3">
              {Object.keys(permissions).length === 0 ? (
                <p className="text-gray-500 text-sm">No permissions added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.keys(permissions).map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {permission}
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(permission)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : id ? 'Update Role' : 'Create Role'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
