import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { buildingDetailsSchema } from '../utils/validationSchemas/buildingDetailsSchema';

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
                <select
                  id="buildingType"
                  {...register('buildingType')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23000' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0 center',
                    backgroundSize: '12px 12px',
                    paddingRight: '20px',
                  }}
                >
                  <option value="">Select building type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Industrial">Industrial</option>
                </select>
                {errors.buildingType && (
                  <p className="mt-1 text-sm text-red-500">{errors.buildingType.message as string}</p>
                )}
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

