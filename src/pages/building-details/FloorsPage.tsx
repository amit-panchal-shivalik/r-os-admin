import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { floorsSchema } from '../../utils/validationSchemas/floorsSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconBuilding } from '@tabler/icons-react';

type FloorsFormData = Yup.InferType<typeof floorsSchema>;

interface Floor {
  id: string;
  floorNumber: number;
  floorName: string;
  blockName: string;
  status: string;
  totalUnits: number;
  description?: string;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Under Construction', label: 'Under Construction' },
];

// Mock blocks data - replace with actual API call
const blockOptions = [
  { value: 'block1', label: 'Block A' },
  { value: 'block2', label: 'Block B' },
  { value: 'block3', label: 'Block C' },
];

// Mock floors data - replace with actual API call
const mockFloors: Floor[] = [
  {
    id: '1',
    floorNumber: 0,
    floorName: 'Ground Floor',
    blockName: 'Block A',
    status: 'Active',
    totalUnits: 10,
    description: 'Ground floor with parking',
  },
  {
    id: '2',
    floorNumber: 1,
    floorName: 'First Floor',
    blockName: 'Block A',
    status: 'Active',
    totalUnits: 8,
    description: 'First floor residential units',
  },
  {
    id: '3',
    floorNumber: 2,
    floorName: 'Second Floor',
    blockName: 'Block B',
    status: 'Active',
    totalUnits: 12,
    description: 'Second floor units',
  },
  {
    id: '4',
    floorNumber: 3,
    floorName: 'Third Floor',
    blockName: 'Block B',
    status: 'Under Construction',
    totalUnits: 0,
    description: 'Under construction',
  },
];

export const FloorsPage = () => {
  const [floors, setFloors] = useState<Floor[]>(mockFloors);
  const [showForm, setShowForm] = useState(false);
  const [showAddMultipleForm, setShowAddMultipleForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Floors - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FloorsFormData>({
    resolver: yupResolver(floorsSchema),
    defaultValues: {
      floorNumber: 0,
      floorName: '',
      description: '',
      totalUnits: 0,
      blockId: '',
      status: '',
    },
  });

  const onSubmit = (data: FloorsFormData) => {
    console.log('Form submitted:', data);
    if (editingFloor) {
      // Update existing floor
      setFloors(
        floors.map((floor) =>
          floor.id === editingFloor.id
            ? {
                ...floor,
                floorNumber: data.floorNumber,
                floorName: data.floorName,
                blockName: blockOptions.find((b) => b.value === data.blockId)?.label || '',
                status: data.status,
                totalUnits: data.totalUnits,
                description: data.description,
              }
            : floor
        )
      );
      setEditingFloor(null);
    } else {
      // Add new floor
      const newFloor: Floor = {
        id: Date.now().toString(),
        floorNumber: data.floorNumber,
        floorName: data.floorName,
        blockName: blockOptions.find((b) => b.value === data.blockId)?.label || '',
        status: data.status,
        totalUnits: data.totalUnits,
        description: data.description,
      };
      setFloors([...floors, newFloor]);
    }
    reset();
    setShowForm(false);
    setShowAddMultipleForm(false);
    alert(editingFloor ? 'Floor updated successfully!' : 'Floor added successfully!');
  };

  const handleEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setValue('floorNumber', floor.floorNumber);
    setValue('floorName', floor.floorName);
    setValue('blockId', blockOptions.find((b) => b.label === floor.blockName)?.value || '');
    setValue('status', floor.status);
    setValue('totalUnits', floor.totalUnits);
    setValue('description', floor.description || '');
    setShowForm(true);
  };

  const handleDelete = (floor: Floor) => {
    if (window.confirm(`Are you sure you want to delete ${floor.floorName}?`)) {
      setFloors(floors.filter((f) => f.id !== floor.id));
      alert('Floor deleted successfully!');
    }
  };

  const handleView = (floor: Floor) => {
    alert(`Floor Details:\nName: ${floor.floorName}\nBlock: ${floor.blockName}\nStatus: ${floor.status}\nUnits: ${floor.totalUnits}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <IconX className="w-4 h-4 text-gray-600" />;
      case 'Under Construction':
        return <IconBuilding className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const columns: Column<Floor>[] = [
    { key: 'floorNumber', header: 'Floor No.', sortable: true },
    { key: 'blockName', header: 'Block', sortable: true },
    { key: 'floorName', header: 'Floor Name', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (floor) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(floor.status)}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              floor.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : floor.status === 'Under Construction'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {floor.status}
          </span>
        </div>
      ),
    },
    { key: 'totalUnits', header: 'Total Units', sortable: true },
  ];

  const actions: ActionButton<Floor>[] = [
    {
      label: 'View',
      icon: <IconEye className="w-4 h-4" />,
      onClick: handleView,
      variant: 'primary',
    },
    {
      label: 'Edit',
      icon: <IconEdit className="w-4 h-4" />,
      onClick: handleEdit,
      variant: 'primary',
    },
    {
      label: 'Delete',
      icon: <IconTrash className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  // Filter floors by search term and filters
  const filteredFloors = floors.filter((floor) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        floor.floorName.toLowerCase().includes(searchLower) ||
        floor.blockName.toLowerCase().includes(searchLower) ||
        floor.status.toLowerCase().includes(searchLower) ||
        floor.floorNumber.toString().includes(searchLower) ||
        floor.totalUnits.toString().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Other filters
    if (selectedFilters.blockName && floor.blockName !== selectedFilters.blockName) {
      return false;
    }
    if (selectedFilters.status && floor.status !== selectedFilters.status) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto ">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Floors</h1>
          <button
            onClick={() => setShowAddMultipleForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Multiple Floors
          </button>
        </div>

        {/* Data Table */}
        {!showForm && !showAddMultipleForm && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search bar and Filters row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search floors by name, block, or status..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    />
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-block"
                      name="filter-block"
                      value={selectedFilters.blockName || ''}
                      onChange={(value) => handleFilterChange('blockName', value)}
                      options={[
                        { value: '', label: 'All Blocks' },
                        ...Array.from(new Set(floors.map((f) => f.blockName)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
                      ]}
                      placeholder="All Blocks"
                      disabled={false}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-status"
                      name="filter-status"
                      value={selectedFilters.status || ''}
                      onChange={(value) => handleFilterChange('status', value)}
                      options={[
                        { value: '', label: 'All Status' },
                        ...Array.from(new Set(floors.map((f) => f.status)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
                      ]}
                      placeholder="All Status"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredFloors}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No floors found"
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {(showForm || showAddMultipleForm) && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingFloor ? 'Edit Floor' : showAddMultipleForm ? 'Add Multiple Floors' : 'Add New Floor'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setShowAddMultipleForm(false);
                  setEditingFloor(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Floor Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Floor Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Floor Number */}
                <div>
                  <label htmlFor="floorNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="floorNumber"
                    {...register('floorNumber', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter floor number"
                  />
                  {errors.floorNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.floorNumber.message as string}</p>
                  )}
                </div>

                {/* Floor Name */}
                <div>
                  <label htmlFor="floorName" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="floorName"
                    {...register('floorName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter floor name (e.g., Ground Floor, First Floor)"
                  />
                  {errors.floorName && (
                    <p className="mt-1 text-sm text-red-500">{errors.floorName.message as string}</p>
                  )}
                </div>

                {/* Block */}
                <div>
                  <label htmlFor="blockId" className="block text-sm font-medium text-gray-700 mb-1">
                    Block <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="blockId"
                    name="blockId"
                    value={watch('blockId') || ''}
                    onChange={(value) => setValue('blockId', value, { shouldValidate: true })}
                    options={blockOptions}
                    placeholder="Select block"
                    error={errors.blockId?.message as string}
                    disabled={false}
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="status"
                    name="status"
                    value={watch('status') || ''}
                    onChange={(value) => setValue('status', value, { shouldValidate: true })}
                    options={statusOptions}
                    placeholder="Select status"
                    error={errors.status?.message as string}
                    disabled={false}
                    required
                  />
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

                {/* Description - Full width */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent resize-y"
                    placeholder="Enter floor description (optional)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message as string}</p>
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
                    floorNumber: 0,
                    floorName: '',
                    description: '',
                    totalUnits: 0,
                    blockId: '',
                    status: '',
                  });
                  setShowForm(false);
                  setShowAddMultipleForm(false);
                  setEditingFloor(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingFloor ? 'Update Floor' : 'Save Floor'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FloorsPage;
