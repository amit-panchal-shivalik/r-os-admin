import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { blocksSchema } from '../../utils/validationSchemas/blocksSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconBuilding } from '@tabler/icons-react';

type BlocksFormData = Yup.InferType<typeof blocksSchema>;

interface Block {
  id: string;
  blockNumber: number;
  blockName: string;
  status: string;
  description?: string;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Under Construction', label: 'Under Construction' },
];

// Mock blocks data - replace with actual API call
const mockBlocks: Block[] = [
  {
    id: '1',
    blockNumber: 1,
    blockName: 'Block A',
    status: 'Active',
    description: 'Main residential block',
  },
  {
    id: '2',
    blockNumber: 2,
    blockName: 'Block B',
    status: 'Active',
    description: 'Secondary residential block',
  },
  {
    id: '3',
    blockNumber: 3,
    blockName: 'Block C',
    status: 'Under Construction',
    description: 'Under construction',
  },
  {
    id: '4',
    blockNumber: 4,
    blockName: 'Block D',
    status: 'Inactive',
    description: 'Temporarily inactive',
  },
];

export const BlocksPage = () => {
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Blocks - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BlocksFormData>({
    resolver: yupResolver(blocksSchema),
    defaultValues: {
      blockName: '',
      status: '',
      description: '',
    },
  });

  const onSubmit = (data: BlocksFormData) => {
    console.log('Form submitted:', data);
    if (editingBlock) {
      // Update existing block
      setBlocks(
        blocks.map((block) =>
          block.id === editingBlock.id
            ? {
                ...block,
                blockName: data.blockName,
                status: data.status,
                description: data.description,
              }
            : block
        )
      );
      setEditingBlock(null);
    } else {
      // Add new block
      const newBlock: Block = {
        id: Date.now().toString(),
        blockNumber: blocks.length + 1,
        blockName: data.blockName,
        status: data.status,
        description: data.description,
      };
      setBlocks([...blocks, newBlock]);
    }
    reset();
    setShowForm(false);
    alert(editingBlock ? 'Block updated successfully!' : 'Block added successfully!');
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setValue('blockName', block.blockName);
    setValue('status', block.status);
    setValue('description', block.description || '');
    setShowForm(true);
  };

  const handleDelete = (block: Block) => {
    if (window.confirm(`Are you sure you want to delete ${block.blockName}?`)) {
      setBlocks(blocks.filter((b) => b.id !== block.id));
      alert('Block deleted successfully!');
    }
  };

  const handleView = (block: Block) => {
    alert(`Block Details:\nName: ${block.blockName}\nStatus: ${block.status}\nDescription: ${block.description || 'N/A'}`);
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

  const columns: Column<Block>[] = [
    { key: 'blockNumber', header: 'Block No.', sortable: true },
    { key: 'blockName', header: 'Block Name', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (block) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(block.status)}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              block.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : block.status === 'Under Construction'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {block.status}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<Block>[] = [
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

  // Filter blocks by search term and filters
  const filteredBlocks = blocks.filter((block) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        block.blockName.toLowerCase().includes(searchLower) ||
        block.status.toLowerCase().includes(searchLower) ||
        block.blockNumber.toString().includes(searchLower) ||
        (block.description && block.description.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Other filters
    if (selectedFilters.status && block.status !== selectedFilters.status) {
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
          <h1 className="text-3xl font-bold text-primary-black">Blocks</h1>
          <button
            onClick={() => {
              reset();
              setEditingBlock(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Block
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
                      placeholder="Search blocks by name or status..."
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
                <div className="flex gap-4 sm:w-48">
                  <CustomSelect
                    id="filter-status"
                    name="filter-status"
                    value={selectedFilters.status || ''}
                    onChange={(value) => handleFilterChange('status', value)}
                    options={[
                      { value: '', label: 'All Status' },
                      ...Array.from(new Set(blocks.map((b) => b.status)))
                        .sort()
                        .map((option) => ({ value: option, label: option })),
                    ]}
                    placeholder="All Status"
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            <DataTable
              data={filteredBlocks}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No blocks found"
              cellPadding="large"
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingBlock ? 'Edit Block' : 'Add New Block'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBlock(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Block Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Block Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block Name */}
                <div>
                  <label htmlFor="blockName" className="block text-sm font-medium text-gray-700 mb-1">
                    Block Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="blockName"
                    {...register('blockName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter block name (e.g., Block A, Block B)"
                  />
                  {errors.blockName && (
                    <p className="mt-1 text-sm text-red-500">{errors.blockName.message as string}</p>
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
                    placeholder="Enter block description (optional)"
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
                    blockName: '',
                    status: '',
                    description: '',
                  });
                  setShowForm(false);
                  setEditingBlock(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingBlock ? 'Update Block' : 'Save Block'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlocksPage;

