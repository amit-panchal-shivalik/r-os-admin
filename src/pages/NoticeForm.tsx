import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  Upload,
  X
} from 'lucide-react';
import { createNotice, updateNotice, getNoticeById, Notice } from '../apis/noticeApi';
import { getAllSocieties, Society } from '../apis/societyApi';
import { toast } from 'sonner';

interface NoticeFormValues {
  title?: string;
  text: string; // Backend uses 'text' not 'content'
  category: string;
  societyId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  image?: File | null;
}

const validationSchema = Yup.object({
  title: Yup.string().optional(),
  text: Yup.string()
    .required('Notice text is required')
    .min(10, 'Text must be at least 10 characters')
    .max(5000, 'Text cannot exceed 5000 characters'),
  category: Yup.string().required('Category selection is required'),
  societyId: Yup.string().required('Society selection is required'),
  status: Yup.string()
    .oneOf(['ACTIVE', 'INACTIVE', 'DRAFT'], 'Invalid status')
    .required('Status is required'),
});

const getInitialValues = (societies: Society[], initialData?: Notice): NoticeFormValues => {
  if (initialData) {
    return {
      title: initialData.title || '',
      text: initialData.text || '',
      category: initialData.category || 'General',
      societyId: initialData.societyId || '',
      status: initialData.status || 'DRAFT',
      image: null,
    };
  }

  // For new notices, don't set a default societyId until societies are loaded
  return {
    title: '',
    text: '',
    category: 'General',
    societyId: '',
    status: 'DRAFT',
    image: null,
  };
};

interface NoticeFormProps {
  isEdit?: boolean;
}

export const NoticeForm: React.FC<NoticeFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  console.log('=== NoticeForm MOUNTED ===');
  console.log('isEdit:', isEdit);
  console.log('id:', id);

  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [societiesLoading, setSocietiesLoading] = useState(true);
  const [initialData, setInitialData] = useState<Notice | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  console.log('Initial state - societies:', societies.length, 'societiesLoading:', societiesLoading);

  // Status options
  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  // Fetch societies - EXACT same approach as SocietiesList
  const fetchSocieties = async () => {
    try {
      setSocietiesLoading(true);
      console.log('=== FETCHING SOCIETIES ===');
      
      const params = {
        page: 1,
        limit: 100,
        search: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      console.log('Calling getAllSocieties with params:', params);
      const data = await getAllSocieties(params);
      console.log('getAllSocieties returned data:', data);
      console.log('Societies array:', data.societies);
      console.log('Societies count:', data.societies?.length || 0);
      
      setSocieties(data.societies);
      console.log('Set societies to state successfully');
    } catch (error: any) {
      console.error('=== ERROR FETCHING SOCIETIES ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      toast.error(error.message || 'Failed to load societies');
      setSocieties([]);
    } finally {
      setSocietiesLoading(false);
      console.log('=== FINISHED FETCHING SOCIETIES ===');
    }
  };

  // Fetch notice data for editing
  const fetchNoticeData = async () => {
    if (!id || !isEdit) return;

    try {
      setLoading(true);
      const noticeData = await getNoticeById(id);
      setInitialData(noticeData);
      
      // Set existing image if available
      if (noticeData.image) {
        setExistingImage(noticeData.image);
      }
    } catch (error: any) {
      console.error('Error fetching notice:', error);
      toast.error('Failed to load notice data');
      navigate('/notice');
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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
    setExistingImage(null);
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchNoticeData();
    }
  }, [id, isEdit]);

  const handleSubmit = async (
    values: NoticeFormValues,
    { setSubmitting }: FormikHelpers<NoticeFormValues>
  ) => {
    try {
      setLoading(true);

      console.log('=== SUBMITTING NOTICE ===');
      console.log('Form values:', values);
      console.log('Image file:', imageFile);

      // Clean up the data - only send what backend expects
      const noticeData = {
        societyId: values.societyId,
        title: values.title || undefined,
        text: values.text,
        category: values.category,
        status: values.status,
      };

      console.log('Cleaned notice data:', noticeData);

      if (isEdit && id) {
        console.log('Updating notice with ID:', id);
        await updateNotice(id, noticeData, imageFile || undefined);
        toast.success('Notice updated successfully!');
      } else {
        console.log('Creating new notice');
        await createNotice(noticeData, imageFile || undefined);
        toast.success('Notice created successfully!');
      }

      navigate('/notice');
    } catch (error: any) {
      console.error('=== ERROR SAVING NOTICE ===');
      console.error('Error saving notice:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} notice`);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (societiesLoading || (isEdit && !initialData && loading)) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">
            {societiesLoading ? 'Loading societies...' : 'Loading notice data...'}
          </p>
        </div>
      </Card>
    );
  }

  // Don't render form if societies are not loaded yet
  if (societies.length === 0 && !societiesLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
          <p className="text-gray-600 text-center">
            No societies available. Please add societies first before creating notices.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Debug: societiesLoading={societiesLoading.toString()}, societies.length={societies.length}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full p-2 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-design-primary">
            {isEdit ? 'Edit Notice' : 'Create New Notice'}
          </h1>
          <p className="text-design-secondary mt-1">
            {isEdit ? 'Update notice details and content' : 'Create a new notice for society members'}
          </p>
        </div>
      </div>

      {/* Notice Form */}
      <Card className="p-6">
        <Formik
          initialValues={getInitialValues(societies, initialData)}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-design-primary" />
                  <h3 className="text-lg font-semibold text-gray-800">Notice Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Society */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Society <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="societyId"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select society</option>
                      {societies.map(society => (
                        <option key={society._id} value={society._id}>
                          {society.societyName}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="societyId" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="category"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select category</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Events">Events</option>
                      <option value="Security">Security</option>
                      <option value="Financial">Financial</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Health">Health</option>
                      <option value="Amenities">Amenities</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Guidelines">Guidelines</option>
                      <option value="General">General</option>
                    </Field>
                    <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select status</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-500" />
                  </div>
                </div>

                {/* Notice Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title (Optional)
                  </label>
                  <Field
                    type="text"
                    name="title"
                    placeholder="Enter a short title for the notice..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                {/* Notice Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Text <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="text"
                    placeholder="Enter the notice content..."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="text" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Image (Optional)
                  </label>
                  
                  {/* Display existing or preview image */}
                  {(imagePreview || existingImage) && (
                    <div className="mb-4 relative inline-block">
                      <img
                        src={imagePreview || existingImage || ''}
                        alt="Notice preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload button */}
                  {!imagePreview && !existingImage && (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/notice')}
                  disabled={isSubmitting || loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isEdit ? 'Update Notice' : 'Create Notice'}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};
