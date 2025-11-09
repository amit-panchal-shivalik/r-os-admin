import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { ArrowLeft, Building2, Clock, DollarSign, CheckCircle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { createAmenity, type Amenity } from '../../apis/amenityApi';
import { getAllSocieties, Society } from '../../apis/societyApi';
import { useAuth } from '../../contexts/AuthContext';

interface CreateAmenityFormValues {
  society: string;
  name: string;
  startTime: string; // HH:MM format only (no date)
  endTime: string;   // HH:MM format only (no date)
  isPaid: boolean;
  amount: string;
  image: string;
  bigImage: string;
}

const validationSchema = Yup.object({
  society: Yup.string().required('Society is required'),
  name: Yup.string()
    .required('Amenity name is required')
    .min(2, 'Amenity name must be at least 2 characters')
    .max(100, 'Amenity name must not exceed 100 characters'),
  startTime: Yup.string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: Yup.string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .test('is-greater', 'End time must be after start time', function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),
  isPaid: Yup.boolean(),
  amount: Yup.string().when('isPaid', {
    is: true,
    then: (schema) =>
      schema
        .required('Amount is required when amenity is paid')
        .test('is-positive', 'Amount must be greater than 0', (value) => {
          return value ? parseFloat(value) > 0 : false;
        }),
    otherwise: (schema) => schema.optional(),
  }),
  image: Yup.string().optional(),
  bigImage: Yup.string().optional(),
});

const getInitialValues = (societyId: string = ''): CreateAmenityFormValues => ({
  society: societyId,
  name: '',
  startTime: '',
  endTime: '',
  isPaid: false,
  amount: '',
  image: '',
  bigImage: '',
});

// Predefined amenity options for convenience
const amenityOptions = [
  { value: 'Clubhouse', label: 'Clubhouse' },
  { value: 'Pilates Studio', label: 'Pilates Studio' },
  { value: 'Yoga Studio', label: 'Yoga Studio' },
  { value: 'Gym', label: 'Gym' },
  { value: 'Conference Room', label: 'Conference Room' },
  { value: 'TT (Table Tennis)', label: 'TT (Table Tennis)' },
  { value: 'Box Cricket', label: 'Box Cricket' },
  { value: 'Swimming Pool', label: 'Swimming Pool' },
  { value: 'Tennis Court', label: 'Tennis Court' },
  { value: 'Basketball Court', label: 'Basketball Court' },
  { value: 'Party Hall', label: 'Party Hall' },
  { value: 'Community Hall', label: 'Community Hall' },
  { value: 'Garden Area', label: 'Garden Area' },
  { value: 'Playground', label: 'Playground' },
  { value: 'Parking Area', label: 'Parking Area' },
];

export const BookAmenity: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [createdAmenity, setCreatedAmenity] = useState<Amenity | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Check if current user is society admin
  const isSocietyAdmin = admin?.roleKey === 'society_admin';
  const assignedSocietyId = admin?.society?.id;

  // Fetch all societies on component mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        setLoadingSocieties(true);
        // Fetch ALL societies (not filtering by status)
        const response = await getAllSocieties({ limit: 100 });
        setSocieties(response.societies);
      } catch (error: any) {
        console.error('Error fetching societies:', error);
        toast.error('Failed to load societies. Please refresh the page.');
      } finally {
        setLoadingSocieties(false);
      }
    };

    fetchSocieties();
  }, []);

  const handleBack = () => {
    navigate('/societies');
  };

  const handleSubmit = async (
    values: CreateAmenityFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CreateAmenityFormValues>
  ) => {
    try {
      setLoading(true);

      // Convert time strings (HH:MM) to timestamps
      // Using today's date with the specified time
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const startDateTime = new Date(`${today}T${values.startTime}:00`);
      const endDateTime = new Date(`${today}T${values.endTime}:00`);

      // Transform form data to match API requirements
      const payload = {
        society: values.society,
        name: values.name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isPaid: values.isPaid,
        amount: values.isPaid ? parseFloat(values.amount) : null,
        image: values.image || null,
        bigImage: values.bigImage || null,
      };

      console.log('Creating amenity with payload:', payload);

      // Call API to create amenity
      const createdAmenity = await createAmenity(payload);

      console.log('Amenity created successfully:', createdAmenity);

      // Store created amenity and show success modal
      setCreatedAmenity(createdAmenity);
      setShowSuccessModal(true);

      toast.success(
        `Amenity "${createdAmenity.name}" created successfully!`,
        {
          description: `Operating hours: ${values.startTime} - ${values.endTime}`,
        }
      );

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error('Error creating amenity:', error);
      toast.error(error.message || 'Failed to create amenity. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    if (!createdAmenity?.qrCode) return;

    const link = document.createElement('a');
    link.href = createdAmenity.qrCode;
    link.download = `${createdAmenity.name}-QR-Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully');
  };

  const handleViewAmenity = () => {
    if (createdAmenity) {
      navigate(`/amenities/view/${createdAmenity._id}`);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCreatedAmenity(null);
    navigate('/amenities');
  };

  // Convert societies to dropdown options with status indicator
  const societyOptions = societies.map((society) => ({
    value: society._id,
    label: `${society.societyName} (${society.societyCode}) - ${society.status}`,
  }));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 text-design-primary hover:bg-design-description"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Societies
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-design-primary">Create Amenity</h1>
          <p className="text-design-secondary mt-1">Add a new amenity with operating hours and pricing</p>
        </div>
      </div>

      {/* Loading State */}
      {loadingSocieties ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-design-primary"></div>
            <span className="ml-3 text-design-secondary">Loading societies...</span>
          </div>
        </Card>
      ) : societies.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Societies Found</h3>
            <p className="text-gray-500 mb-4">Please create a society first before adding amenities.</p>
            <Button onClick={() => navigate('/societies/add')} className="btn-primary">
              Create Society
            </Button>
          </div>
        </Card>
      ) : (
        /* Amenity Form */
        <Card className="p-6">
          <Formik
            initialValues={getInitialValues(isSocietyAdmin ? assignedSocietyId : '')}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Society Selection - FIRST & PROMINENT (Hidden for Society Admin) */}
                {!isSocietyAdmin && (
                  <div className="bg-background border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-gray-700" />
                        <label htmlFor="society" className="text-base font-semibold text-gray-800">
                          Step 1: Select Society *
                        </label>
                      </div>
                      <Field
                        as="select"
                        id="society"
                        name="society"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose the society for this amenity</option>
                        {societyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="society" component="div" className="text-red-500 text-sm font-medium" />
                      <p className="text-xs text-blue-700">
                        First, select which society this amenity belongs to
                      </p>
                </div>
                )}
                
                {/* Hidden field for society admin to include society ID in form */}
                {isSocietyAdmin && (
                  <Field type="hidden" name="society" value={assignedSocietyId} />
                )}

                {/* Amenity Details Section */}
                <div className={isSocietyAdmin ? '' : 'border-t pt-6'}>
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    {isSocietyAdmin ? 'Step 1: Amenity Details' : 'Step 2: Amenity Details'}
                  </h3>

                  {/* Amenity Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Amenity Name *
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter amenity name (e.g., Swimming Pool, Gym, Tennis Court)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      list="amenity-suggestions"
                    />
                    {/* Datalist for suggestions */}
                    <datalist id="amenity-suggestions">
                      {amenityOptions.map((option) => (
                        <option key={option.value} value={option.value} />
                      ))}
                    </datalist>
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    <p className="text-xs text-gray-500">
                      Type an amenity name or select from suggestions (Swimming Pool, Gym, Tennis Court, etc.)
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" />
                    {isSocietyAdmin ? 'Step 2: Operating Hours' : 'Step 3: Operating Hours'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Start Time *</label>
                      <Field
                        name="startTime"
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="startTime" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">End Time *</label>
                      <Field
                        name="endTime"
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="endTime" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Define when this amenity is available for use</p>
                </div>

                {/* Payment Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5" />
                    {isSocietyAdmin ? 'Step 3: Payment Details' : 'Step 4: Payment Details'}
                  </h3>

                  {/* Is Paid Checkbox */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Field
                      name="isPaid"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      This amenity requires payment
                    </label>
                  </div>

                  {/* Amount Field - Conditional */}
                  {values.isPaid && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Amount (₹) *</label>
                      <Field
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter amount (e.g., 500)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="amount" component="div" className="text-red-500 text-sm" />
                      <p className="text-xs text-gray-500">A QR code will be automatically generated for payment</p>
                    </div>
                  )}
                </div>

                {/* Image Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5" />
                    {isSocietyAdmin ? 'Step 4: Amenity Images (Optional)' : 'Step 5: Amenity Images (Optional)'}
                  </h3>

                  {/* Image URL */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <Field
                      name="image"
                      type="text"
                      placeholder="Enter image URL for amenity thumbnail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                    <p className="text-xs text-gray-500">
                      Provide a URL for the amenity thumbnail image (e.g., https://example.com/image.jpg)
                    </p>
                  </div>

                  {/* Big Image URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Large Image URL</label>
                    <Field
                      name="bigImage"
                      type="text"
                      placeholder="Enter large image URL for amenity detail view"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="bigImage" component="div" className="text-red-500 text-sm" />
                    <p className="text-xs text-gray-500">
                      Provide a URL for the large/detail image (e.g., https://example.com/large-image.jpg)
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Amenity'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      )}

      {/* Success Modal with QR Code */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Amenity Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your amenity has been created and is now available.
            </DialogDescription>
          </DialogHeader>

          {createdAmenity && (
            <div className="space-y-4 py-4">
              {/* Amenity Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Amenity Name:</span>
                  <span className="text-base font-semibold text-gray-900">{createdAmenity.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Operating Hours:</span>
                  <span className="text-base font-semibold text-gray-900">
                    {createdAmenity.startTime} - {createdAmenity.endTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Payment:</span>
                  <span className="text-base font-semibold text-gray-900">
                    {createdAmenity.isPaid ? `₹${createdAmenity.amount}` : 'Free'}
                  </span>
                </div>
              </div>

              {/* QR Code Display */}
              {createdAmenity.isPaid && createdAmenity.qrCode && (
                <div className="border-t pt-4">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Payment QR Code Generated
                    </h3>
                    
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-200 inline-block">
                      <img 
                        src={createdAmenity.qrCode} 
                        alt={`QR Code for ${createdAmenity.name}`}
                        className="w-[200px] h-[200px]"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Amount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{createdAmenity.amount}</p>
                    </div>

                    <Button
                      onClick={handleDownloadQR}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </Button>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 text-center">
                        Users can scan this QR code to make payment for this amenity
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Free Amenity Message */}
              {!createdAmenity.isPaid && (
                <div className="border-t pt-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center font-medium">
                      This is a free amenity. No payment QR code needed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              onClick={handleViewAmenity}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            <Button
              onClick={handleCloseModal}
              className="btn-primary"
            >
              Go to Amenities List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
