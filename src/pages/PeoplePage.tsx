import React from 'react';

export const PeoplePage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">People Management</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900 mb-2">People Management System</h2>
            <p className="text-gray-500">
              Manage users, roles, and permissions from this central location.
            </p>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
