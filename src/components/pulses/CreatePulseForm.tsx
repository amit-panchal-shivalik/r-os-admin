import React, { useState } from 'react';
import { pulsesAPI } from '../../api/pulses';

interface CreatePulseFormProps {
  communityId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePulseForm: React.FC<CreatePulseFormProps> = ({ communityId, onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const mediaUrlArray = mediaUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      await pulsesAPI.create({
        communityId,
        content,
        mediaUrls: mediaUrlArray,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create pulse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-pulse-form-overlay">
      <form onSubmit={handleSubmit} className="create-pulse-form">
        <h3>Create New Pulse</h3>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="What's on your mind?"
            required
          />
        </div>

        <div className="form-group">
          <label>Media URLs (one per line)</label>
          <textarea
            value={mediaUrls}
            onChange={(e) => setMediaUrls(e.target.value)}
            rows={3}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Pulse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePulseForm;
