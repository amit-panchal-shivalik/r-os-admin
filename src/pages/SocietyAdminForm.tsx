import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  createSocietyAdmin,
  updateSocietyAdmin,
  SocietyAdmin,
  CreateSocietyAdminPayload,
  UpdateSocietyAdminPayload,
} from '@/apis/societyAdminApi';
import { getSocieties } from '@/apis/societyApi';

interface Society {
  _id: string;
  societyName: string;
}

interface SocietyAdminFormProps {
  admin?: SocietyAdmin | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SocietyAdminForm: React.FC<SocietyAdminFormProps> = ({
  admin,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const isEditMode = !!admin;

  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    societyId: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const response = await getSocieties({ page: 1, limit: 100 });
        console.log('Societies API Response:', response);
        console.log('Societies Array:', response.societies);
        setSocieties(response.societies || []);
      } catch (error: any) {
        console.error('Error fetching societies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load societies',
          variant: 'destructive',
        });
      } finally {
        setLoadingSocieties(false);
      }
    };

    fetchSocieties();
  }, []);

  // Populate form with existing admin data
  useEffect(() => {
    if (admin) {
      const nameParts = admin.fullName.split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: admin.email,
        password: '',
        phone: admin.phone || '',
        societyId: admin.societyId || '',
        isActive: admin.isActive,
      });
    }
  }, [admin]);

  // Handle input change
  const handleChange = (field: string, value: any) => {
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

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      // Society is now optional - if not provided, user will be created as super admin
    } else {
      // Edit mode validations
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && admin) {
        // Update admin
        const updatePayload: UpdateSocietyAdminPayload = {};
        
        if (formData.firstName) updatePayload.firstName = formData.firstName;
        if (formData.lastName) updatePayload.lastName = formData.lastName;
        if (formData.email && formData.email !== admin.email) {
          updatePayload.email = formData.email;
        }
        if (formData.password) updatePayload.password = formData.password;
        if (formData.phone !== admin.phone) updatePayload.phone = formData.phone;
        
        // Always send societyId if it has changed (including when clearing)
        const currentSocietyId = admin.societyId || '';
        const newSocietyId = formData.societyId || '';
        if (newSocietyId !== currentSocietyId) {
          updatePayload.societyId = formData.societyId || null;
        }
        
        updatePayload.isActive = formData.isActive;

        await updateSocietyAdmin(admin._id, updatePayload);
        toast({
          title: 'Success',
          description: 'Society admin updated successfully',
        });
      } else {
        // Create new admin
        const createPayload: CreateSocietyAdminPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          societyId: formData.societyId || undefined, // Send undefined if empty
        };

        await createSocietyAdmin(createPayload);
        toast({
          title: 'Success',
          description: formData.societyId ? 'Society admin created successfully' : 'Super admin created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} society admin`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? 'Edit Society Admin' : 'Add Society Admin'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter first name"
            disabled={loading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter last name"
            disabled={loading}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {!isEditMode && <span className="text-destructive">*</span>}
            {isEditMode && (
              <span className="text-xs text-muted-foreground ml-2">
                (Leave blank to keep current password)
              </span>
            )}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={isEditMode ? 'Enter new password' : 'Enter password'}
            disabled={loading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
            disabled={loading}
          />
        </div>

        {/* Society */}
        <div className="space-y-2">
          <Label htmlFor="societyId">
            Society {!isEditMode && <span className="text-muted-foreground text-xs">(Optional - leave empty for Super Admin)</span>}
            {isEditMode && <span className="text-muted-foreground text-xs">(Change to update role)</span>}
          </Label>
          <Select
            value={formData.societyId}
            onValueChange={(value) => handleChange('societyId', value === 'none' ? '' : value)}
            disabled={loading || loadingSocieties}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a society (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">None (Super Admin)</span>
              </SelectItem>
              {societies.map((society) => (
                <SelectItem key={society._id} value={society._id}>
                  {society.societyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.societyId && (
            <p className="text-sm text-destructive">{errors.societyId}</p>
          )}
          {isEditMode && formData.societyId && (
            <p className="text-xs text-muted-foreground">
              Select "None" to convert to Super Admin
            </p>
          )}
          {isEditMode && !formData.societyId && (
            <p className="text-xs text-muted-foreground">
              Currently a Super Admin. Select a society to convert to Society Admin
            </p>
          )}
        </div>

        {/* Active Status */}
        {isEditMode && (
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
              disabled={loading}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
            ? 'Update Admin'
            : 'Create Admin'}
        </Button>
      </div>
    </form>
  );
};

export default SocietyAdminForm;

