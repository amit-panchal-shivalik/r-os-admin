import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { buildingDetailsSchema } from '../utils/validationSchemas/buildingDetailsSchema';
import { CustomSelect } from '../components/ui/CustomSelect';

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
    reset,
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

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-black mb-2">Building Details</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-black mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Building Name */}
              <div>
                <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-1">
                  Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="buildingName"
                  {...register('buildingName')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter building name"
                />
                {errors.buildingName && (
                  <p className="mt-1 text-sm text-red-500">{errors.buildingName.message as string}</p>
                )}
              </div>

              {/* Society Name */}
              <div>
                <label htmlFor="societyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Society Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="societyName"
                  {...register('societyName')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter society name"
                />
                {errors.societyName && (
                  <p className="mt-1 text-sm text-red-500">{errors.societyName.message as string}</p>
                )}
              </div>

              {/* Address - Full width */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  {...register('address')}
                  rows={3}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent resize-y"
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address.message as string}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  {...register('city')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message as string}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  {...register('state')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message as string}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  {...register('pincode')}
                  maxLength={6}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter pincode"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setValue('pincode', value, { shouldValidate: true });
                  }}
                />
                {errors.pincode && (
                  <p className="mt-1 text-sm text-red-500">{errors.pincode.message as string}</p>
                )}
              </div>

              {/* Building Type */}
              <div>
                <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Building Type <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  id="buildingType"
                  name="buildingType"
                  value={watch('buildingType') || ''}
                  onChange={(value) => setValue('buildingType', value, { shouldValidate: true })}
                  options={[
                    { value: 'Residential', label: 'Residential' },
                    { value: 'Commercial', label: 'Commercial' },
                    { value: 'Mixed', label: 'Mixed' },
                    { value: 'Industrial', label: 'Industrial' },
                  ]}
                  placeholder="Select building type"
                  error={errors.buildingType?.message as string}
                  disabled={false}
                  required
                />
              </div>

              {/* Total Blocks */}
              <div>
                <label htmlFor="totalBlocks" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Blocks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalBlocks"
                  {...register('totalBlocks', { valueAsNumber: true })}
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="0"
                />
                {errors.totalBlocks && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalBlocks.message as string}</p>
                )}
              </div>

              {/* Total Units */}
              <div>
                <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalUnits"
                  {...register('totalUnits', { valueAsNumber: true })}
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="0"
                />
                {errors.totalUnits && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalUnits.message as string}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset({
                  buildingName: '',
                  societyName: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  totalBlocks: 0,
                  totalUnits: 0,
                  buildingType: '',
                });
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

