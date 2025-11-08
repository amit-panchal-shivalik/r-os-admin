import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { noticeBoardSchema } from '../../utils/validationSchemas/noticeBoardSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconClock, IconArchive } from '@tabler/icons-react';

type NoticeBoardFormData = Yup.InferType<typeof noticeBoardSchema>;

interface Notice {
  id: string;
  noticeNumber: string;
  title: string;
  category: string;
  blockName: string;
  unitNumber: string;
  priority: string;
  publishDate: string;
  expiryDate: string;
  status: string;
}

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Archived', label: 'Archived' },
];

const categoryOptions = [
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Event', label: 'Event' },
  { value: 'General', label: 'General' },
  { value: 'Emergency', label: 'Emergency' },
];

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

const blockOptions = [
  { value: 'block1', label: 'Block A' },
  { value: 'block2', label: 'Block B' },
  { value: 'block3', label: 'Block C' },
];

const unitOptions = [
  { value: 'unit1', label: '101' },
  { value: 'unit2', label: '102' },
  { value: 'unit3', label: '201' },
  { value: 'unit4', label: '202' },
  { value: 'unit5', label: '301' },
];

const mockNotices: Notice[] = [
  {
    id: '1',
    noticeNumber: 'NB-001',
    title: 'Monthly Maintenance Payment Due',
    category: 'Payment',
    blockName: 'Block A',
    unitNumber: '101',
    priority: 'High',
    publishDate: '2024-01-15',
    expiryDate: '2024-01-31',
    status: 'Published',
  },
  {
    id: '2',
    noticeNumber: 'NB-002',
    title: 'Society Meeting Scheduled',
    category: 'Meeting',
    blockName: 'Block B',
    unitNumber: '201',
    priority: 'Medium',
    publishDate: '2024-01-20',
    expiryDate: '2024-02-05',
    status: 'Published',
  },
  {
    id: '3',
    noticeNumber: 'NB-003',
    title: 'Parking Area Maintenance',
    category: 'Maintenance',
    blockName: 'Block A',
    unitNumber: '102',
    priority: 'Low',
    publishDate: '2024-01-10',
    expiryDate: '2024-01-25',
    status: 'Expired',
  },
  {
    id: '4',
    noticeNumber: 'NB-004',
    title: 'New Year Celebration Event',
    category: 'Event',
    blockName: 'Block C',
    unitNumber: '301',
    priority: 'Medium',
    publishDate: '2024-01-25',
    expiryDate: '2024-02-10',
    status: 'Draft',
  },
];

export const NoticeBoardPage = () => {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('');
  const [dateFilterTo, setDateFilterTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Notice Board - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NoticeBoardFormData>({
    resolver: yupResolver(noticeBoardSchema),
    defaultValues: {
      noticeNumber: '',
      title: '',
      category: '',
      blockId: '',
      unitId: '',
      priority: '',
      publishDate: '',
      expiryDate: '',
      status: '',
    },
  });

  const onSubmit = (data: NoticeBoardFormData) => {
    console.log('Form submitted:', data);
    if (editingNotice) {
      setNotices(
        notices.map((notice) =>
          notice.id === editingNotice.id
            ? {
                ...notice,
                noticeNumber: data.noticeNumber,
                title: data.title,
                category: categoryOptions.find((c) => c.value === data.category)?.label || '',
                blockName: blockOptions.find((b) => b.value === data.blockId)?.label || '',
                unitNumber: unitOptions.find((u) => u.value === data.unitId)?.label || '',
                priority: data.priority,
                publishDate: data.publishDate,
                expiryDate: data.expiryDate,
                status: data.status,
              }
            : notice
        )
      );
      setEditingNotice(null);
    } else {
      const newNotice: Notice = {
        id: Date.now().toString(),
        noticeNumber: data.noticeNumber,
        title: data.title,
        category: categoryOptions.find((c) => c.value === data.category)?.label || '',
        blockName: blockOptions.find((b) => b.value === data.blockId)?.label || '',
        unitNumber: unitOptions.find((u) => u.value === data.unitId)?.label || '',
        priority: data.priority,
        publishDate: data.publishDate,
        expiryDate: data.expiryDate,
        status: data.status,
      };
      setNotices([...notices, newNotice]);
    }
    reset();
    setShowForm(false);
    alert(editingNotice ? 'Notice updated successfully!' : 'Notice added successfully!');
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setValue('noticeNumber', notice.noticeNumber);
    setValue('title', notice.title);
    setValue('category', categoryOptions.find((c) => c.label === notice.category)?.value || '');
    setValue('blockId', blockOptions.find((b) => b.label === notice.blockName)?.value || '');
    setValue('unitId', unitOptions.find((u) => u.label === notice.unitNumber)?.value || '');
    setValue('priority', notice.priority);
    setValue('publishDate', notice.publishDate);
    setValue('expiryDate', notice.expiryDate);
    setValue('status', notice.status);
    setShowForm(true);
  };

  const handleDelete = (notice: Notice) => {
    if (window.confirm(`Are you sure you want to delete notice ${notice.noticeNumber}?`)) {
      setNotices(notices.filter((n) => n.id !== notice.id));
      alert('Notice deleted successfully!');
    }
  };

  const handleView = (notice: Notice) => {
    alert(
      `Notice Details:\nNotice No.: ${notice.noticeNumber}\nTitle: ${notice.title}\nCategory: ${notice.category}\nBlock: ${notice.blockName}\nUnit: ${notice.unitNumber}\nPriority: ${notice.priority}\nPublish Date: ${notice.publishDate}\nExpiry Date: ${notice.expiryDate}\nStatus: ${notice.status}`
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'Draft':
        return <IconClock className="w-4 h-4 text-yellow-600" />;
      case 'Expired':
        return <IconX className="w-4 h-4 text-red-600" />;
      case 'Archived':
        return <IconArchive className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Notice>[] = [
    { key: 'noticeNumber', header: 'Notice Number', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'blockName', header: 'Block', sortable: true },
    { key: 'unitNumber', header: 'Unit', sortable: true },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (notice) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(notice.priority)}`}>
          {notice.priority}
        </span>
      ),
    },
    { key: 'publishDate', header: 'Publish Date', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (notice) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(notice.status)}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(notice.status)}`}>
            {notice.status}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<Notice>[] = [
    { label: 'View', icon: <IconEye className="w-4 h-4" />, onClick: handleView, variant: 'primary' },
    { label: 'Edit', icon: <IconEdit className="w-4 h-4" />, onClick: handleEdit, variant: 'primary' },
    { label: 'Delete', icon: <IconTrash className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' },
  ];

  // Filter notices by date range, search term, and other filters
  const filteredNotices = notices.filter((notice) => {
    // Date filter
    if (dateFilterFrom || dateFilterTo) {
      const noticeDateStr = notice.publishDate.split('T')[0];
      
      if (dateFilterFrom && dateFilterTo) {
        if (!(noticeDateStr >= dateFilterFrom && noticeDateStr <= dateFilterTo)) {
          return false;
        }
      } else if (dateFilterFrom) {
        if (!(noticeDateStr >= dateFilterFrom)) {
          return false;
        }
      } else if (dateFilterTo) {
        if (!(noticeDateStr <= dateFilterTo)) {
          return false;
        }
      }
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        notice.noticeNumber.toLowerCase().includes(searchLower) ||
        notice.title.toLowerCase().includes(searchLower) ||
        notice.category.toLowerCase().includes(searchLower) ||
        notice.status.toLowerCase().includes(searchLower) ||
        notice.blockName.toLowerCase().includes(searchLower) ||
        notice.unitNumber.toLowerCase().includes(searchLower) ||
        notice.priority.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Other filters
    if (selectedFilters.category && notice.category !== selectedFilters.category) {
      return false;
    }
    if (selectedFilters.blockName && notice.blockName !== selectedFilters.blockName) {
      return false;
    }
    if (selectedFilters.priority && notice.priority !== selectedFilters.priority) {
      return false;
    }
    if (selectedFilters.status && notice.status !== selectedFilters.status) {
      return false;
    }

    return true;
  });

  const handleClearDateFilter = () => {
    setDateFilterFrom('');
    setDateFilterTo('');
  };

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
          <h1 className="text-3xl font-bold text-primary-black">Notice Board</h1>
          <button
            onClick={() => {
              reset();
              setEditingNotice(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Notice
          </button>
        </div>

        {/* Data Table */}
        {!showForm && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search bar and Date filters row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search notices by number, title, category, or status..."
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

                {/* Date Filters */}
                <div className="flex gap-4">
                  <div className="sm:w-40">
                    <input
                      type="date"
                      id="dateFilterFrom"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      placeholder="From Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                    />
                  </div>
                  <div className="sm:w-40">
                    <input
                      type="date"
                      id="dateFilterTo"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      placeholder="To Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                      min={dateFilterFrom || undefined}
                    />
                  </div>
                  {(dateFilterFrom || dateFilterTo) && (
                    <button
                      type="button"
                      onClick={handleClearDateFilter}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 whitespace-nowrap"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <CustomSelect
                    id="filter-category"
                    name="filter-category"
                    value={selectedFilters.category || ''}
                    onChange={(value) => handleFilterChange('category', value)}
                    options={[
                      { value: '', label: 'All Category' },
                      ...Array.from(new Set(notices.map((n) => n.category)))
                        .sort()
                        .map((option) => ({ value: option, label: option })),
                    ]}
                    placeholder="All Category"
                    disabled={false}
                  />
                </div>
                <div className="flex-1">
                  <CustomSelect
                    id="filter-block"
                    name="filter-block"
                    value={selectedFilters.blockName || ''}
                    onChange={(value) => handleFilterChange('blockName', value)}
                    options={[
                      { value: '', label: 'All Blocks' },
                      ...Array.from(new Set(notices.map((n) => n.blockName)))
                        .sort()
                        .map((option) => ({ value: option, label: option })),
                    ]}
                    placeholder="All Blocks"
                    disabled={false}
                  />
                </div>
                <div className="flex-1">
                  <CustomSelect
                    id="filter-priority"
                    name="filter-priority"
                    value={selectedFilters.priority || ''}
                    onChange={(value) => handleFilterChange('priority', value)}
                    options={[
                      { value: '', label: 'All Priority' },
                      ...Array.from(new Set(notices.map((n) => n.priority)))
                        .sort()
                        .map((option) => ({ value: option, label: option })),
                    ]}
                    placeholder="All Priority"
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
                      ...Array.from(new Set(notices.map((n) => n.status)))
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
              data={filteredNotices}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No notices found"
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingNotice ? 'Edit Notice' : 'Add New Notice'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNotice(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Notice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="noticeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="noticeNumber"
                    {...register('noticeNumber')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter notice number (e.g., NB-001)"
                  />
                  {errors.noticeNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.noticeNumber.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter notice title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="category"
                    name="category"
                    value={watch('category') || ''}
                    onChange={(value) => setValue('category', value, { shouldValidate: true })}
                    options={categoryOptions}
                    placeholder="Select category"
                    error={errors.category?.message as string}
                    disabled={false}
                    required
                  />
                </div>
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
                <div>
                  <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="unitId"
                    name="unitId"
                    value={watch('unitId') || ''}
                    onChange={(value) => setValue('unitId', value, { shouldValidate: true })}
                    options={unitOptions}
                    placeholder="Select unit"
                    error={errors.unitId?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="priority"
                    name="priority"
                    value={watch('priority') || ''}
                    onChange={(value) => setValue('priority', value, { shouldValidate: true })}
                    options={priorityOptions}
                    placeholder="Select priority"
                    error={errors.priority?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="publishDate"
                    {...register('publishDate')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent text-sm text-primary-black [color-scheme:light]"
                  />
                  {errors.publishDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.publishDate.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    {...register('expiryDate')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent text-sm text-primary-black [color-scheme:light]"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiryDate.message as string}</p>
                  )}
                </div>
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

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    noticeNumber: '',
                    title: '',
                    category: '',
                    blockId: '',
                    unitId: '',
                    priority: '',
                    publishDate: '',
                    expiryDate: '',
                    status: '',
                  });
                  setShowForm(false);
                  setEditingNotice(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingNotice ? 'Update Notice' : 'Save Notice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

