import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { rolesApi } from '../../services/api';
import type { Role } from '../../types';

export const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRole(id);
    }
  }, [id]);

  const loadRole = async (roleId: string) => {
    try {
      setLoading(true);
      const data = await rolesApi.getById(roleId);
      setRole(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Role not found'}
        </div>
        <Link
          to="/roles"
          className="text-blue-600 hover:text-blue-900"
        >
          ← Back to Roles
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Role Details</h1>
          <div className="flex gap-3">
            <Link
              to="/roles"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Back to List
            </Link>
<Link
              to={`/roles/${role.id}/edit`}
              className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Role
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {role.name}
              </h2>
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  role.isSystem
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {role.isSystem ? 'System Role' : 'Custom Role'}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 py-5 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Description
              </h3>
              <p className="text-gray-900">
                {role.description || 'No description provided'}
              </p>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Permissions ({Object.keys(role.permissions).length})
              </h3>
              {Object.keys(role.permissions).length === 0 ? (
                <p className="text-gray-500 italic">No permissions assigned</p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(role.permissions).map(([permission, enabled]) => (
                      <div
                        key={permission}
                        className={`flex items-center px-3 py-2 rounded-md ${
                          enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 mr-2 ${
                            enabled ? 'text-green-600' : 'text-red-600'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {enabled ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          )}
                        </svg>
                        <span className="text-sm font-medium">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Metadata
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                    {role.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {role.isSystem ? 'System-defined (cannot be deleted)' : 'Custom'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(role.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(role.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
