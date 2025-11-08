import apiClient from './apiService';

export interface SocietyData {
  // Basic Information
  societyName: string;
  societyCode: string;
  description?: string;
  logo?: File | string | null;

  // Project Details
  projectType: string;
  totalUnits: number | string;
  totalBlocks?: number | string;
  totalFloors?: number | string;
  carpetAreaRange?: string;
  projectStartDate?: string;
  completionDate?: string;
  developerName: string;

  // Contact Information
  contactPersonName: string;
  contactNumber: string;
  email: string;
  alternateContact?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Legal Documents
  legalDocuments?: {
    rera?: {
      number?: string;
      expiryDate?: string;
    };
    fireNoc?: {
      number?: string;
      validityDate?: string;
    };
    buCertificate?: {
      number?: string;
      issueDate?: string;
    };
    liftLicence?: {
      number?: string;
      expiryDate?: string;
    };
  };

  // Financial Setup
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    branchName?: string;
    branchAddress?: string;
  };

  taxInformation: {
    gstNumber: string;
    panNumber: string;
    tanNumber?: string;
  };

  financialYear: {
    fyStartMonth: string;
    currentFinancialYear: string;
  };

  // Additional Settings
  status?: string;
  maintenanceBillingCycle: string;
  registeredMembersCount?: number | string;
}

export interface SocietyResponse {
  message: string;
  result: Society;
}

export interface Society {
  _id: string;
  societyName: string;
  societyCode: string;
  description?: string;
  logo?: string;
  projectType: string;
  totalUnits: number;
  totalBlocks?: number;
  totalFloors?: number;
  carpetAreaRange?: string;
  projectStartDate?: string;
  completionDate?: string;
  developerName: string;
  contactPersonName: string;
  contactNumber: string;
  email: string;
  alternateContact?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  legalDocuments?: {
    rera?: {
      number?: string;
      certificate?: string;
      expiryDate?: string;
    };
    fireNoc?: {
      number?: string;
      document?: string;
      validityDate?: string;
    };
    buCertificate?: {
      number?: string;
      certificate?: string;
      issueDate?: string;
    };
    liftLicence?: {
      number?: string;
      document?: string;
      expiryDate?: string;
    };
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    branchName?: string;
    branchAddress?: string;
  };
  taxInformation?: {
    gstNumber: string;
    gstCertificate?: string;
    panNumber: string;
    tanNumber?: string;
  };
  financialYear?: {
    fyStartMonth: string;
    currentFinancialYear: string;
  };
  status: 'Active' | 'Pending' | 'Inactive';
  maintenanceBillingCycle?: string;
  registeredMembersCount?: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SocietiesListResponse {
  message: string;
  result: {
    societies: Society[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface StatsResponse {
  message: string;
  result: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    totalMembers: number;
    byType: Record<string, number>;
    byProjectType: Record<string, number>;
  };
}

/**
 * Generate unique society code
 */
export const generateSocietyCode = async (): Promise<{ societyCode: string }> => {
  const response = await apiClient.post<any>('/societies/generate-code');
  return response.data.result || response.data.data;
};

/**
 * Create a new society
 */
export const createSociety = async (data: SocietyData, files?: Record<string, File>): Promise<any> => {
  const formData = new FormData();

  // Append basic fields
  formData.append('societyName', data.societyName);
  formData.append('societyCode', data.societyCode);
  if (data.description) formData.append('description', data.description);

  // Project details
  formData.append('projectType', data.projectType);
  formData.append('totalUnits', data.totalUnits.toString());
  if (data.totalBlocks) formData.append('totalBlocks', data.totalBlocks.toString());
  if (data.totalFloors) formData.append('totalFloors', data.totalFloors.toString());
  if (data.carpetAreaRange) formData.append('carpetAreaRange', data.carpetAreaRange);
  if (data.projectStartDate) formData.append('projectStartDate', data.projectStartDate);
  if (data.completionDate) formData.append('completionDate', data.completionDate);
  formData.append('developerName', data.developerName);

  // Contact information
  formData.append('contactPersonName', data.contactPersonName);
  formData.append('contactNumber', data.contactNumber);
  formData.append('email', data.email);
  if (data.alternateContact) formData.append('alternateContact', data.alternateContact);

  // Address (nested object)
  formData.append('address[street]', data.address.street);
  formData.append('address[city]', data.address.city);
  formData.append('address[state]', data.address.state);
  formData.append('address[pincode]', data.address.pincode);

  // Legal documents (nested object)
  if (data.legalDocuments?.rera?.number) {
    formData.append('legalDocuments[rera][number]', data.legalDocuments.rera.number);
  }
  if (data.legalDocuments?.rera?.expiryDate) {
    formData.append('legalDocuments[rera][expiryDate]', data.legalDocuments.rera.expiryDate);
  }
  if (data.legalDocuments?.fireNoc?.number) {
    formData.append('legalDocuments[fireNoc][number]', data.legalDocuments.fireNoc.number);
  }
  if (data.legalDocuments?.fireNoc?.validityDate) {
    formData.append('legalDocuments[fireNoc][validityDate]', data.legalDocuments.fireNoc.validityDate);
  }
  if (data.legalDocuments?.buCertificate?.number) {
    formData.append('legalDocuments[buCertificate][number]', data.legalDocuments.buCertificate.number);
  }
  if (data.legalDocuments?.buCertificate?.issueDate) {
    formData.append('legalDocuments[buCertificate][issueDate]', data.legalDocuments.buCertificate.issueDate);
  }
  if (data.legalDocuments?.liftLicence?.number) {
    formData.append('legalDocuments[liftLicence][number]', data.legalDocuments.liftLicence.number);
  }
  if (data.legalDocuments?.liftLicence?.expiryDate) {
    formData.append('legalDocuments[liftLicence][expiryDate]', data.legalDocuments.liftLicence.expiryDate);
  }

  // Bank details (nested object)
  formData.append('bankDetails[bankName]', data.bankDetails.bankName);
  formData.append('bankDetails[accountNumber]', data.bankDetails.accountNumber);
  formData.append('bankDetails[accountHolderName]', data.bankDetails.accountHolderName);
  formData.append('bankDetails[ifscCode]', data.bankDetails.ifscCode);
  if (data.bankDetails.branchName) formData.append('bankDetails[branchName]', data.bankDetails.branchName);
  if (data.bankDetails.branchAddress) formData.append('bankDetails[branchAddress]', data.bankDetails.branchAddress);

  // Tax information (nested object)
  formData.append('taxInformation[gstNumber]', data.taxInformation.gstNumber);
  formData.append('taxInformation[panNumber]', data.taxInformation.panNumber);
  if (data.taxInformation.tanNumber) formData.append('taxInformation[tanNumber]', data.taxInformation.tanNumber);

  // Financial year (nested object)
  formData.append('financialYear[fyStartMonth]', data.financialYear.fyStartMonth);
  formData.append('financialYear[currentFinancialYear]', data.financialYear.currentFinancialYear);

  // Additional settings
  if (data.status) formData.append('status', data.status);
  formData.append('maintenanceBillingCycle', data.maintenanceBillingCycle);
  if (data.registeredMembersCount) formData.append('registeredMembersCount', data.registeredMembersCount.toString());

  // Append files
  if (files) {
    if (files.logo) formData.append('logo', files.logo);
    if (files.reraCertificate) formData.append('reraCertificate', files.reraCertificate);
    if (files.fireNocDocument) formData.append('fireNocDocument', files.fireNocDocument);
    if (files.buCertificate) formData.append('buCertificate', files.buCertificate);
    if (files.liftLicenceDocument) formData.append('liftLicenceDocument', files.liftLicenceDocument);
    if (files.gstCertificate) formData.append('gstCertificate', files.gstCertificate);
  }

  const response = await apiClient.post<SocietyResponse>('/societies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
};

/**
 * Get all societies with filters
 */
export const getAllSocieties = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  projectType?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<SocietiesListResponse['result']> => {
  const response = await apiClient.get<SocietiesListResponse>('/societies', { params });
  return response.data.result;
};

/**
 * Get society by ID
 */
export const getSocietyById = async (id: string): Promise<Society> => {
  const response = await apiClient.get<SocietyResponse>(`/societies/${id}`);
  return response.data.result;
};

/**
 * Get society by code
 */
export const getSocietyByCode = async (code: string): Promise<Society> => {
  const response = await apiClient.get<SocietyResponse>(`/societies/code/${code}`);
  return response.data.result;
};

/**
 * Update society
 */
export const updateSociety = async (id: string, data: Partial<SocietyData>, files?: Record<string, File>): Promise<any> => {
  const formData = new FormData();

  // Append only provided fields
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    if (value !== undefined && value !== null && typeof value !== 'object') {
      formData.append(key, value.toString());
    }
  });

  // Handle nested objects
  if (data.address) {
    Object.keys(data.address).forEach((key) => {
      formData.append(`address[${key}]`, (data.address as any)[key]);
    });
  }

  if (data.bankDetails) {
    Object.keys(data.bankDetails).forEach((key) => {
      formData.append(`bankDetails[${key}]`, (data.bankDetails as any)[key]);
    });
  }

  if (data.taxInformation) {
    Object.keys(data.taxInformation).forEach((key) => {
      formData.append(`taxInformation[${key}]`, (data.taxInformation as any)[key]);
    });
  }

  if (data.financialYear) {
    Object.keys(data.financialYear).forEach((key) => {
      formData.append(`financialYear[${key}]`, (data.financialYear as any)[key]);
    });
  }

  // Append files
  if (files) {
    Object.keys(files).forEach((key) => {
      formData.append(key, files[key]);
    });
  }

  const response = await apiClient.put<SocietyResponse>(`/societies/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
};

/**
 * Delete society (soft delete)
 */
export const deleteSociety = async (id: string): Promise<void> => {
  await apiClient.delete(`/societies/${id}`);
};

/**
 * Get society statistics
 */
export const getSocietyStats = async (): Promise<StatsResponse['result']> => {
  const response = await apiClient.get<StatsResponse>('/societies/stats');
  return response.data.result;
};

/**
 * Upload documents for existing society
 */
export const uploadSocietyDocuments = async (id: string, files: Record<string, File>): Promise<any> => {
  const formData = new FormData();

  Object.keys(files).forEach((key) => {
    formData.append(key, files[key]);
  });

  const response = await apiClient.post<SocietyResponse>(`/societies/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
};

