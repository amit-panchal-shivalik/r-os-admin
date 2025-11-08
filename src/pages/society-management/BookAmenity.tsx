import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import SelectInput from '../../components/CustomInput/SelectInput';
import { ArrowLeft, Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BookAmenityFormValues {
  amenityName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isPayable: boolean;
  price: string;
}

const validationSchema = Yup.object({
  amenityName: Yup.string().required('Amenity name is required'),
  startDate: Yup.string().required('Start date is required'),
  startTime: Yup.string().required('Start time is required'),
  endDate: Yup.string().required('End date is required'),
  endTime: Yup.string().required('End time is required'),
  isPayable: Yup.boolean(),
  price: Yup.string().when('isPayable', {
    is: true,
    then: (schema) => schema.required('Price is required when amenity is payable'),
    otherwise: (schema) => schema.optional(),
  }),
});

const getInitialValues = (): BookAmenityFormValues => ({
  amenityName: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  isPayable: false,
  price: '',
});

// Sample amenity options - replace with API data
const amenityOptions = [
  { value: 'swimming_pool', label: 'Swimming Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'tennis_court', label: 'Tennis Court' },
  { value: 'basketball_court', label: 'Basketball Court' },
  { value: 'club_house', label: 'Club House' },
  { value: 'garden', label: 'Garden Area' },
  { value: 'party_hall', label: 'Party Hall' },
  { value: 'other', label: 'Other' },
];

export const BookAmenity: React.FC = () => {
  console.log('BookAmenity component is rendering');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate('/societies');
  };

  const handleSubmit = async (
    values: BookAmenityFormValues,
    { setSubmitting }: FormikHelpers<BookAmenityFormValues>
  ) => {
    try {
      setLoading(true);

      // Here you would typically call an API to book the amenity
      console.log('Booking amenity:', values);

      toast.success('Amenity booked successfully!');

      // Navigate back to societies list or to a confirmation page
      navigate('/societies');

    } catch (error: any) {
      console.error('Error booking amenity:', error);
      toast.error(error.message || 'Failed to book amenity');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

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
        <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-design-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-design-primary">Book Amenity</h1>
          <p className="text-design-secondary mt-1">Book your preferred amenity for use</p>
        </div>
      </div>

      {/* Booking Form */}
      <Card className="p-6">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Amenity Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Amenity Name *
                </label>
                <Field
                  name="amenityName"
                  component={SelectInput}
                  options={amenityOptions}
                  placeholder="Select an amenity"
                />
                <ErrorMessage name="amenityName" component="div" className="text-red-500 text-sm" />
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Start Time
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date *</label>
                    <Field
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time *</label>
                    <Field
                      name="startTime"
                      as="input"
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="startTime" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-design-primary flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    End Time
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date *</label>
                    <Field
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time *</label>
                    <Field
                      name="endTime"
                      as="input"
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

                {/* Is Payable Checkbox */}
                <div className="flex items-center space-x-2 mb-4">
                  <Field
                    name="isPayable"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    This amenity requires payment
                  </label>
                </div>

                {/* Price Field - Conditional */}
                {values.isPayable && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price (₹) *</label>
                    <Field
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter price amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
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
                  className="btn-primary min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    'Book Amenity'
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
