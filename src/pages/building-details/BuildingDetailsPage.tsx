import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import TextInput from '../../components/CustomInput/TextInput';
import TextareaInput from '../../components/CustomInput/TextareInput';
import SelectInput from '../../components/CustomInput/SelectInput';

// Validation schema
const buildingDetailsSchema = Yup.object().shape({
  buildingName: Yup.string()
    .required('Building Name is required')
    .trim()
    .test('no-whitespace', 'Building Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  societyName: Yup.string()
    .required('Society Name is required')
    .trim()
    .test('no-whitespace', 'Society Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  address: Yup.string()
    .required('Address is required')
    .trim()
    .test('no-whitespace', 'Address cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  city: Yup.string()
    .required('City is required')
    .trim()
    .test('no-whitespace', 'City cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  state: Yup.string()
    .required('State is required')
    .trim()
    .test('no-whitespace', 'State cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  totalBlocks: Yup.number()
    .required('Total Blocks is required')
    .integer('Total Blocks must be a whole number')
    .min(0, 'Total Blocks cannot be negative')
    .typeError('Total Blocks must be a number'),
  totalUnits: Yup.number()
    .required('Total Units is required')
    .integer('Total Units must be a whole number')
    .min(0, 'Total Units cannot be negative')
    .typeError('Total Units must be a number'),
  buildingType: Yup.string()
    .required('Building Type is required')
    .oneOf(['Residential', 'Commercial', 'Mixed', 'Industrial'], 'Please select a valid building type'),
});

type BuildingDetailsFormData = Yup.InferType<typeof buildingDetailsSchema>;

const buildingTypeOptions = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Industrial', label: 'Industrial' },
];

export const BuildingDetailsPage = () => {
  useEffect(() => {
    document.title = 'Building Details - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuildingDetailsFormData>({
    resolver: yupResolver(buildingDetailsSchema),
    defaultValues: {
      buildingName: '',
      societyName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      totalBlocks: 0,
      totalUnits: 0,
      buildingType: '',
    },
  });

  const onSubmit = (data: BuildingDetailsFormData) => {
    console.log('Form submitted:', data);
    // TODO: Handle form submission (API call, etc.)
    alert('Building details saved successfully!');
  };

  const formValues = watch();

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-black mb-2">Building Details</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-black mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Building Name */}
              <div>
                <TextInput
                  id="buildingName"
                  label="Building Name"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  value={formValues.buildingName}
                  onChange={(e) => setValue('buildingName', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* Society Name */}
              <div>
                <TextInput
                  id="societyName"
                  label="Society Name"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  value={formValues.societyName}
                  onChange={(e) => setValue('societyName', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* Address - Full width */}
              <div className="md:col-span-2">
                <TextareaInput
                  id="address"
                  label="Address"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  rows={3}
                  value={formValues.address}
                  onChange={(e) => setValue('address', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* City */}
              <div>
                <TextInput
                  id="city"
                  label="City"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  value={formValues.city}
                  onChange={(e) => setValue('city', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* State */}
              <div>
                <TextInput
                  id="state"
                  label="State"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  value={formValues.state}
                  onChange={(e) => setValue('state', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* Pincode */}
              <div>
                <TextInput
                  id="pincode"
                  label="Pincode"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  type="text"
                  maxLength={6}
                  value={formValues.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setValue('pincode', value, { shouldValidate: true });
                  }}
                />
              </div>

              {/* Building Type */}
              <div>
                <SelectInput
                  id="buildingType"
                  label="Building Type"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  options={buildingTypeOptions}
                  value={formValues.buildingType}
                  onChange={(e) => setValue('buildingType', e.target.value, { shouldValidate: true })}
                />
              </div>

              {/* Total Blocks */}
              <div>
                <TextInput
                  id="totalBlocks"
                  label="Total Blocks"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  type="number"
                  min="0"
                  value={formValues.totalBlocks?.toString() || '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue('totalBlocks', Math.max(0, value), { shouldValidate: true });
                  }}
                />
              </div>

              {/* Total Units */}
              <div>
                <TextInput
                  id="totalUnits"
                  label="Total Units"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  required
                  type="number"
                  min="0"
                  value={formValues.totalUnits?.toString() || '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue('totalUnits', Math.max(0, value), { shouldValidate: true });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                // Reset form
                setValue('buildingName', '');
                setValue('societyName', '');
                setValue('address', '');
                setValue('city', '');
                setValue('state', '');
                setValue('pincode', '');
                setValue('totalBlocks', 0);
                setValue('totalUnits', 0);
                setValue('buildingType', '');
              }}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingDetailsPage;

