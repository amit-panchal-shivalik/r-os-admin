import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { getComplaintById, updateComplaint } from '../../apis/complaintApi';
import { getAllSocieties } from '../../apis/societyApi';
import {
  Complaint,
  ComplaintUpdateData,
  COMPLAINT_TYPES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from '../../types/ComplaintTypes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';

export const EditComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [societies, setSocieties] = useState<any[]>([]);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ComplaintUpdateData>({
    society: '',
    type: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    'resolution.notes': '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch complaint data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setFetchingData(true);
        const [complaintData, societiesData] = await Promise.all([
          getComplaintById(id),
          getAllSocieties({ limit: 100 }),
        ]);

        setComplaint(complaintData);
        setSocieties(societiesData.societies);

        // Set form data
        setFormData({
          society: complaintData.society._id,
          type: complaintData.type,
          description: complaintData.description,
          priority: complaintData.priority,
          status: complaintData.status,
          'resolution.notes': complaintData.resolution?.notes || '',
        });

        // Set existing image preview
        if (complaintData.image) {
          setImagePreview(complaintData.image);
        }
      } catch (error: any) {
        console.error('Error fetching complaint:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch complaint',
        });
        navigate('/complaints');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handle input change
  const handleInputChange = (field: keyof ComplaintUpdateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please select a valid image file',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Image size should not exceed 5MB',
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      setLoading(true);

      await updateComplaint(id, formData, imageFile || undefined);

      toast({
        title: 'Success',
        description: 'Complaint updated successfully',
      });

      navigate('/complaints');
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update complaint',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading complaint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/complaints')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Complaints
        </Button>
        <h1 className="text-3xl font-bold">Edit Complaint</h1>
        <p className="text-gray-500 mt-1">
          Complaint ID: {complaint?.complaintId}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Society (Read-only) */}
            <div className="space-y-2">
              <Label>Society</Label>
              <Input
                value={`${complaint?.society.societyName} (${complaint?.society.societyCode})`}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Complaint Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select complaint type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the complaint in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className="flex justify-between text-sm">
                {errors.description ? (
                  <p className="text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-gray-500">Minimum 10 characters required</p>
                )}
                <p className="text-gray-500">{formData.description?.length || 0} / 2000</p>
              </div>
            </div>

            {/* Resolution Notes */}
            {(formData.status === 'Resolved' || formData.status === 'Closed') && (
              <div className="space-y-2">
                <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Add resolution notes..."
                  value={formData['resolution.notes']}
                  onChange={(e) => handleInputChange('resolution.notes', e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-auto rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label htmlFor="image">
                    <Button type="button" variant="outline" className="mt-4" asChild>
                      <span>Select Image</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Complaint'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/complaints')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

