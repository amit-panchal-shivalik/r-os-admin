// Complaint Types and Enums

export enum ComplaintType {
  PARKING = 'Parking',
  NEIGHBOUR_COMMUNITY = 'Neighbour/Community',
  ELECTRICITY = 'Electricity',
  MAINTENANCE = 'Maintenance',
  CLEANLINESS = 'Cleanliness',
  MISCONDUCT = 'Misconduct',
  SERVICE = 'Service',
}

export enum ComplaintStatus {
  PENDING = 'Pending',
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum ComplaintPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface ComplaintResolution {
  notes: string | null;
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  resolvedAt: string | null;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  society: {
    _id: string;
    societyName: string;
    societyCode: string;
    address?: {
      street?: string;
      city: string;
      state?: string;
      pincode?: string;
    };
    logo?: string;
    contactPersonName?: string;
    contactNumber?: string;
    email?: string;
  };
  type: ComplaintType;
  title: string;
  description: string;
  image: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  resolution?: ComplaintResolution;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintFormData {
  society: string;
  type: ComplaintType | string;
  title: string;
  description: string;
  image?: File | null;
  priority?: ComplaintPriority | string;
  status?: ComplaintStatus | string;
}

export interface ComplaintUpdateData {
  society?: string;
  type?: ComplaintType | string;
  title?: string;
  description?: string;
  image?: File | null;
  priority?: ComplaintPriority | string;
  status?: ComplaintStatus | string;
  'resolution.notes'?: string;
}

export interface ComplaintListParams {
  page?: number;
  limit?: number;
  search?: string;
  society?: string;
  type?: ComplaintType | string;
  status?: ComplaintStatus | string;
  priority?: ComplaintPriority | string;
  sortBy?: 'createdAt' | 'updatedAt' | 'complaintId' | 'type' | 'status' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ComplaintPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ComplaintListResponse {
  message: string;
  result: {
    complaints: Complaint[];
    pagination: ComplaintPagination;
  };
}

export interface ComplaintResponse {
  message: string;
  result: Complaint;
}

export interface ComplaintStats {
  total: number;
  byStatus: {
    pending: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface ComplaintStatsResponse {
  message: string;
  result: ComplaintStats;
}

// Dropdown options for forms
export const COMPLAINT_TYPES = [
  { value: ComplaintType.PARKING, label: 'Parking' },
  { value: ComplaintType.NEIGHBOUR_COMMUNITY, label: 'Neighbour/Community' },
  { value: ComplaintType.ELECTRICITY, label: 'Electricity' },
  { value: ComplaintType.MAINTENANCE, label: 'Maintenance' },
  { value: ComplaintType.CLEANLINESS, label: 'Cleanliness' },
  { value: ComplaintType.MISCONDUCT, label: 'Misconduct' },
  { value: ComplaintType.SERVICE, label: 'Service' },
];

export const COMPLAINT_STATUSES = [
  { value: ComplaintStatus.PENDING, label: 'Pending' },
  { value: ComplaintStatus.OPEN, label: 'Open' },
  { value: ComplaintStatus.IN_PROGRESS, label: 'In Progress' },
  { value: ComplaintStatus.RESOLVED, label: 'Resolved' },
  { value: ComplaintStatus.CLOSED, label: 'Closed' },
];

export const COMPLAINT_PRIORITIES = [
  { value: ComplaintPriority.LOW, label: 'Low' },
  { value: ComplaintPriority.MEDIUM, label: 'Medium' },
  { value: ComplaintPriority.HIGH, label: 'High' },
  { value: ComplaintPriority.URGENT, label: 'Urgent' },
];

// Helper function to get status color
export const getStatusColor = (status: ComplaintStatus): string => {
  switch (status) {
    case ComplaintStatus.PENDING:
      return 'bg-orange-100 text-orange-800';
    case ComplaintStatus.OPEN:
      return 'bg-yellow-100 text-yellow-800';
    case ComplaintStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case ComplaintStatus.RESOLVED:
      return 'bg-green-100 text-green-800';
    case ComplaintStatus.CLOSED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get priority color
export const getPriorityColor = (priority: ComplaintPriority): string => {
  switch (priority) {
    case ComplaintPriority.LOW:
      return 'bg-gray-100 text-gray-800';
    case ComplaintPriority.MEDIUM:
      return 'bg-blue-100 text-blue-800';
    case ComplaintPriority.HIGH:
      return 'bg-orange-100 text-orange-800';
    case ComplaintPriority.URGENT:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

