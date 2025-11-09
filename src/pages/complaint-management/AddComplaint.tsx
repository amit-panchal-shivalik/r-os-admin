import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { createComplaint } from '../../apis/complaintApi';
import { getAllSocieties } from '../../apis/societyApi';
import {
  ComplaintFormData,
  COMPLAINT_TYPES,
  COMPLAINT_PRIORITIES,
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

export const AddComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ComplaintFormData>({
    society: '',
    type: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const data = await getAllSocieties({ limit: 100 });
        setSocieties(data.societies);
      } catch (error) {
        console.error('Error fetching societies:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch societies',
        });
      }
    };

    fetchSocieties();
  }, []);

  // Handle input change
  const handleInputChange = (field: keyof ComplaintFormData, value: any) => {
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

    if (!formData.society) {
      newErrors.society = 'Please select a society';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a complaint type';
    }

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

    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      setLoading(true);

      await createComplaint(formData, imageFile || undefined);

      toast({
        title: 'Success',
        description: 'Complaint created successfully',
      });

      navigate('/complaints');
    } catch (error: any) {
      console.error('Error creating complaint:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create complaint',
      });
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Add New Complaint</h1>
        <p className="text-gray-500 mt-1">Create a new complaint for a society</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Society */}
            <div className="space-y-2">
              <Label htmlFor="society">
                Society <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.society}
                onValueChange={(value) => handleInputChange('society', value)}
              >
                <SelectTrigger id="society" className={errors.society ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a society" />
                </SelectTrigger>
                <SelectContent>
                  {societies.map((society) => (
                    <SelectItem key={society._id} value={society._id}>
                      {society.societyName} ({society.societyCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.society && (
                <p className="text-sm text-red-500">{errors.society}</p>
              )}
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
                <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
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
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
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
                <p className="text-gray-500">{formData.description.length} / 2000</p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Image (Optional)</Label>
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
                {loading ? 'Creating...' : 'Create Complaint'}
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

