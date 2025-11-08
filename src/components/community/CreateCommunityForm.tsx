import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';

interface CreateCommunityFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateCommunityForm: React.FC<CreateCommunityFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    territoryId: '',
    category: '',
    status: 'active',
    bannerUrl: '',
  });
  const [territories, setTerritories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTerritories();
  }, []);

  const loadTerritories = async () => {
    try {
      const response = await adminAPI.getTerritories();
      setTerritories(response.data.territories);
    } catch (error) {
      console.error('Failed to load territories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminAPI.createCommunity(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Technology',
    'Health & Fitness',
    'Arts & Culture',
    'Business',
    'Education',
    'Sports',
    'Food & Dining',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="create-community-form">
      <h2>Create New Community</h2>

      <div className="form-group">
        <label>Community Banner URL</label>
        <input
          type="url"
          value={formData.bannerUrl}
          onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
          placeholder="https://example.com/banner.jpg"
        />
      </div>

      <div className="form-group">
        <label>Community Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label>Territory *</label>
        <select
          value={formData.territoryId}
          onChange={(e) => setFormData({ ...formData, territoryId: e.target.value })}
          required
        >
          <option value="">Select Territory</option>
          {territories.map((territory) => (
            <option key={territory._id} value={territory._id}>
              {territory.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Category *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </div>
    </form>
  );
};

export default CreateCommunityForm;
