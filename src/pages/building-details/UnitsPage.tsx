import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { unitsSchema } from '../../utils/validationSchemas/unitsSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconBuilding } from '@tabler/icons-react';

type UnitsFormData = Yup.InferType<typeof unitsSchema>;

interface Unit {
  id: string;
  unitNumber: string;
  blockNumber: string;
  floorNumber: string;
  type: string;
  area: number;
  status: string;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Rented', label: 'Rented' },
];

const unitTypeOptions = [
  { value: '1 BHK', label: '1 BHK' },
  { value: '2 BHK', label: '2 BHK' },
  { value: '3 BHK', label: '3 BHK' },
  { value: '4 BHK', label: '4 BHK' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Shop', label: 'Shop' },
  { value: 'Office', label: 'Office' },
];

// Mock blocks data - replace with actual API call
const blockOptions = [
  { value: 'block1', label: 'Block A' },
  { value: 'block2', label: 'Block B' },
  { value: 'block3', label: 'Block C' },
];

// Mock floors data - replace with actual API call
const floorOptions = [
  { value: 'floor1', label: 'Ground Floor' },
  { value: 'floor2', label: 'First Floor' },
  { value: 'floor3', label: 'Second Floor' },
  { value: 'floor4', label: 'Third Floor' },
];

// Mock units data - replace with actual API call
const mockUnits: Unit[] = [
  {
    id: '1',
    unitNumber: '101',
    blockNumber: 'Block A',
    floorNumber: 'Ground Floor',
    type: '2 BHK',
    area: 1200,
    status: 'Active',
  },
  {
    id: '2',
    unitNumber: '102',
    blockNumber: 'Block A',
    floorNumber: 'Ground Floor',
    type: '2 BHK',
    area: 1200,
    status: 'Active',
  },
  {
    id: '3',
    unitNumber: '201',
    blockNumber: 'Block A',
    floorNumber: 'First Floor',
    type: '3 BHK',
    area: 1500,
    status: 'Rented',
  },
  {
    id: '4',
    unitNumber: '202',
    blockNumber: 'Block B',
    floorNumber: 'First Floor',
    type: '1 BHK',
    area: 800,
    status: 'Sold',
  },
  {
    id: '5',
    unitNumber: '301',
    blockNumber: 'Block B',
    floorNumber: 'Second Floor',
    type: '4 BHK',
    area: 2000,
    status: 'Under Construction',
  },
];

export const UnitsPage = () => {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Units - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UnitsFormData>({
    resolver: yupResolver(unitsSchema),
    defaultValues: {
      unitNumber: '',
      blockId: '',
      floorId: '',
      type: '',
      area: 0,
      status: '',
    },
  });

  const onSubmit = (data: UnitsFormData) => {
    console.log('Form submitted:', data);
    if (editingUnit) {
      // Update existing unit
      setUnits(
        units.map((unit) =>
          unit.id === editingUnit.id
            ? {
                ...unit,
                unitNumber: data.unitNumber,
                blockNumber: blockOptions.find((b) => b.value === data.blockId)?.label || '',
                floorNumber: floorOptions.find((f) => f.value === data.floorId)?.label || '',
                type: data.type,
                area: data.area,
                status: data.status,
              }
            : unit
        )
      );
      setEditingUnit(null);
    } else {
      // Add new unit
      const newUnit: Unit = {
        id: Date.now().toString(),
        unitNumber: data.unitNumber,
        blockNumber: blockOptions.find((b) => b.value === data.blockId)?.label || '',
        floorNumber: floorOptions.find((f) => f.value === data.floorId)?.label || '',
        type: data.type,
        area: data.area,
        status: data.status,
      };
      setUnits([...units, newUnit]);
    }
    reset();
    setShowForm(false);
    alert(editingUnit ? 'Unit updated successfully!' : 'Unit added successfully!');
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setValue('unitNumber', unit.unitNumber);
    setValue('blockId', blockOptions.find((b) => b.label === unit.blockNumber)?.value || '');
    setValue('floorId', floorOptions.find((f) => f.label === unit.floorNumber)?.value || '');
    setValue('type', unit.type);
    setValue('area', unit.area);
    setValue('status', unit.status);
    setShowForm(true);
  };

  const handleDelete = (unit: Unit) => {
    if (window.confirm(`Are you sure you want to delete Unit ${unit.unitNumber}?`)) {
      setUnits(units.filter((u) => u.id !== unit.id));
      alert('Unit deleted successfully!');
    }
  };

  const handleView = (unit: Unit) => {
    alert(`Unit Details:\nUnit Number: ${unit.unitNumber}\nBlock: ${unit.blockNumber}\nFloor: ${unit.floorNumber}\nType: ${unit.type}\nArea: ${unit.area} sq. ft.\nStatus: ${unit.status}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <IconX className="w-4 h-4 text-gray-600" />;
      case 'Under Construction':
        return <IconBuilding className="w-4 h-4 text-yellow-600" />;
      case 'Sold':
        return <IconCheck className="w-4 h-4 text-blue-600" />;
      case 'Rented':
        return <IconCheck className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Under Construction':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sold':
        return 'bg-blue-100 text-blue-800';
      case 'Rented':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Unit>[] = [
    { key: 'unitNumber', header: 'Unit No.', sortable: true },
    { key: 'blockNumber', header: 'Block No.', sortable: true },
    { key: 'floorNumber', header: 'Floor No.', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'area',
      header: 'Area',
      sortable: true,
      render: (unit) => `${unit.area} sq. ft.`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (unit) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(unit.status)}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(unit.status)}`}>
            {unit.status}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<Unit>[] = [
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

  // Filter units by search term and filters
  const filteredUnits = units.filter((unit) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        unit.unitNumber.toLowerCase().includes(searchLower) ||
        unit.blockNumber.toLowerCase().includes(searchLower) ||
        unit.floorNumber.toLowerCase().includes(searchLower) ||
        unit.type.toLowerCase().includes(searchLower) ||
        unit.status.toLowerCase().includes(searchLower) ||
        unit.area.toString().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Other filters
    if (selectedFilters.blockNumber && unit.blockNumber !== selectedFilters.blockNumber) {
      return false;
    }
    if (selectedFilters.type && unit.type !== selectedFilters.type) {
      return false;
    }
    if (selectedFilters.status && unit.status !== selectedFilters.status) {
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
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Units</h1>
          <button
            onClick={() => {
              reset();
              setEditingUnit(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Unit
          </button>
        </div>

        {/* Data Table */}
        {!showForm && (
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
                      placeholder="Search units by number, block, floor, type, or status..."
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
                      value={selectedFilters.blockNumber || ''}
                      onChange={(value) => handleFilterChange('blockNumber', value)}
                      options={[
                        { value: '', label: 'All Blocks' },
                        ...Array.from(new Set(units.map((u) => u.blockNumber)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
                      ]}
                      placeholder="All Blocks"
                      disabled={false}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-type"
                      name="filter-type"
                      value={selectedFilters.type || ''}
                      onChange={(value) => handleFilterChange('type', value)}
                      options={[
                        { value: '', label: 'All Types' },
                        ...Array.from(new Set(units.map((u) => u.type)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
                      ]}
                      placeholder="All Types"
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
                        ...Array.from(new Set(units.map((u) => u.status)))
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
              data={filteredUnits}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No units found"
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUnit(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Unit Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Unit Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit Number */}
                <div>
                  <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unitNumber"
                    {...register('unitNumber')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter unit number (e.g., 101, 202)"
                  />
                  {errors.unitNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.unitNumber.message as string}</p>
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

                {/* Floor */}
                <div>
                  <label htmlFor="floorId" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="floorId"
                    name="floorId"
                    value={watch('floorId') || ''}
                    onChange={(value) => setValue('floorId', value, { shouldValidate: true })}
                    options={floorOptions}
                    placeholder="Select floor"
                    error={errors.floorId?.message as string}
                    disabled={false}
                    required
                  />
                </div>

                {/* Unit Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="type"
                    name="type"
                    value={watch('type') || ''}
                    onChange={(value) => setValue('type', value, { shouldValidate: true })}
                    options={unitTypeOptions}
                    placeholder="Select unit type"
                    error={errors.type?.message as string}
                    disabled={false}
                    required
                  />
                </div>

                {/* Area */}
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq. ft.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="area"
                    {...register('area', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter area in square feet"
                  />
                  {errors.area && (
                    <p className="mt-1 text-sm text-red-500">{errors.area.message as string}</p>
                  )}
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
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    unitNumber: '',
                    blockId: '',
                    floorId: '',
                    type: '',
                    area: 0,
                    status: '',
                  });
                  setShowForm(false);
                  setEditingUnit(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingUnit ? 'Update Unit' : 'Save Unit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UnitsPage;

