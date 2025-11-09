import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Building2, Clock, DollarSign, CheckCircle, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getAmenityById, updateAmenity, type Amenity } from '../../apis/amenityApi';
import { getAllSocieties, type Society } from '../../apis/societyApi';

interface EditAmenityFormValues {
  society: string;
  name: string;
  startTime: string;
  endTime: string;
  isPaid: boolean;
  amount: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
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
  status: Yup.string().oneOf(['ACTIVE', 'INACTIVE', 'DELETED']).required('Status is required'),
});

export const EditAmenity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [amenity, setAmenity] = useState<Amenity | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      
      // Fetch amenity and societies in parallel
      const [amenityData, societiesResponse] = await Promise.all([
        getAmenityById(id!),
        getAllSocieties({ limit: 100 }),
      ]);

      setAmenity(amenityData);
      setSocieties(societiesResponse.societies);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load amenity details');
      navigate('/amenities');
    } finally {
      setFetchingData(false);
      setLoadingSocieties(false);
    }
  };

  const handleBack = () => {
    navigate('/amenities');
  };

  const handleView = () => {
    navigate(`/amenities/view/${id}`);
  };

  const handleSubmit = async (
    values: EditAmenityFormValues,
    { setSubmitting }: FormikHelpers<EditAmenityFormValues>
  ) => {
    try {
      setLoading(true);

      const payload = {
        society: values.society,
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime,
        isPaid: values.isPaid,
        amount: values.isPaid ? parseFloat(values.amount) : null,
      };

      console.log('Updating amenity with payload:', payload);

      const updatedAmenity = await updateAmenity(id!, payload);

      console.log('Amenity updated successfully:', updatedAmenity);

      toast.success(
        `Amenity "${updatedAmenity.name}" updated successfully!`,
        {
          description: `Status: ${updatedAmenity.status}`,
        }
      );

      // Navigate back to amenities list after a short delay
      setTimeout(() => {
        navigate('/amenities');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating amenity:', error);
      toast.error(error.message || 'Failed to update amenity. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    if (!amenity?.qrCode) return;

    const link = document.createElement('a');
    link.href = amenity.qrCode;
    link.download = `${amenity.name}-QR-Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully');
  };

  // Convert societies to dropdown options
  const societyOptions = societies.map((society) => ({
    value: society._id,
    label: `${society.societyName} (${society.societyCode}) - ${society.status}`,
  }));

  const getInitialValues = (): EditAmenityFormValues => {
    if (!amenity) {
      return {
        society: '',
        name: '',
        startTime: '',
        endTime: '',
        isPaid: false,
        amount: '',
        status: 'ACTIVE',
      };
    }

    return {
      society: amenity.society,
      name: amenity.name,
      startTime: amenity.startTime,
      endTime: amenity.endTime,
      isPaid: amenity.isPaid,
      amount: amenity.amount ? amenity.amount.toString() : '',
      status: amenity.status,
    };
  };

  if (fetchingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-start">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Amenities
          </Button>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-design-primary"></div>
            <span className="ml-3 text-design-secondary">Loading amenity details...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!amenity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-start">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Amenities
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Amenity Not Found</h3>
            <p className="text-gray-500">The amenity you're trying to edit doesn't exist.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 text-design-primary hover:bg-design-description"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Amenities
        </Button>
        <Button
          onClick={handleView}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-design-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-design-primary">Edit Amenity</h1>
          <p className="text-design-secondary mt-1">Update amenity details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Formik
              initialValues={getInitialValues()}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Society Selection */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <label htmlFor="society" className="text-base font-semibold text-gray-800">
                        Society *
                      </label>
                    </div>
                    <Field
                      as="select"
                      id="society"
                      name="society"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingSocieties}
                    >
                      <option value="">Select a society</option>
                      {societyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="society" component="div" className="text-red-500 text-sm font-medium" />
                  </div>

                  {/* Amenity Details */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      Amenity Details
                    </h3>

                    <div className="space-y-4">
                      {/* Amenity Name */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Amenity Name *
                        </label>
                        <Field
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter amenity name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">
                          Status *
                        </label>
                        <Field
                          as="select"
                          id="status"
                          name="status"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="DELETED">Deleted</option>
                        </Field>
                        <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5" />
                      Operating Hours
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time *</label>
                        <Field
                          id="startTime"
                          name="startTime"
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="startTime" component="div" className="text-red-500 text-sm" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time *</label>
                        <Field
                          id="endTime"
                          name="endTime"
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="endTime" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5" />
                      Payment Details
                    </h3>

                    <div className="flex items-center space-x-2 mb-4">
                      <Field
                        id="isPaid"
                        name="isPaid"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
                        This amenity requires payment
                      </label>
                    </div>

                    {values.isPaid && (
                      <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (₹) *</label>
                        <Field
                          id="amount"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="amount" component="div" className="text-red-500 text-sm" />
                        <p className="text-xs text-gray-500">
                          {amenity.qrCode ? 'QR code will be updated if amount changes' : 'A new QR code will be generated'}
                        </p>
                      </div>
                    )}
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
                          Updating...
                        </>
                      ) : (
                        'Update Amenity'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-design-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Current QR Code
            </h2>
            {amenity.isPaid && amenity.qrCode ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-center">
                    <img 
                      src={amenity.qrCode} 
                      alt={`QR Code for ${amenity.name}`}
                      className="w-full max-w-[200px] h-auto"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">Current Amount</p>
                  <p className="text-2xl font-bold text-blue-600">₹{amenity.amount}</p>
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700 text-center">
                    Note: Changing payment details will generate a new QR code
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {amenity.isPaid ? 'QR Code will be generated' : 'Free Amenity'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {amenity.isPaid 
                    ? 'Set an amount to generate QR code'
                    : 'Enable paid amenity to generate QR code'
                  }
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

