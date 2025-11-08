# Societies API Integration Guide

## Overview
This document explains how the Societies API has been integrated into the frontend application.

## API Endpoint
```
GET http://localhost:7001/admin/api/v1/societies
```

## Configuration

### Environment Variables
Create a `.env` file in the root of the `r-os-admin` directory:

```env
VITE_API_URL=http://localhost:7001/admin/api/v1
```

### API Client Setup
The API client is configured in `/src/apis/apiService.ts` and automatically:
- Adds authentication token from localStorage
- Handles 401/403 responses by redirecting to login
- Provides global error handling

## API Functions

### 1. Get All Societies
```typescript
import { getAllSocieties } from '../../apis/societyApi';

const data = await getAllSocieties({
  page: 1,
  limit: 10,
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
});

// Returns:
// {
//   societies: Society[],
//   pagination: {
//     total: number,
//     page: number,
//     limit: number,
//     totalPages: number,
//     hasNextPage: boolean,
//     hasPrevPage: boolean
//   }
// }
```

### 2. Get Society By ID
```typescript
import { getSocietyById } from '../../apis/societyApi';

const society = await getSocietyById('690f71c2c37f0538fa1be3e2');
```

### 3. Create Society
```typescript
import { createSociety, generateSocietyCode } from '../../apis/societyApi';

// Generate unique code first
const { societyCode } = await generateSocietyCode();

// Create society with form data and files
const society = await createSociety(formData, {
  logo: logoFile,
  reraCertificate: reraFile,
  fireNocDocument: fireNocFile,
  buCertificate: buCertFile,
  liftLicenceDocument: liftLicenceFile,
  gstCertificate: gstCertFile
});
```

### 4. Update Society
```typescript
import { updateSociety } from '../../apis/societyApi';

const updated = await updateSociety(societyId, partialData, files);
```

### 5. Delete Society
```typescript
import { deleteSociety } from '../../apis/societyApi';

await deleteSociety(societyId);
```

### 6. Get Society Statistics
```typescript
import { getSocietyStats } from '../../apis/societyApi';

const stats = await getSocietyStats();
// Returns: { 
//   total: number,
//   active: number,
//   pending: number,
//   inactive: number,
//   totalMembers: number,
//   byType: Record<string, number>,
//   byProjectType: Record<string, number>
// }

// Example:
// {
//   total: 1,
//   active: 0,
//   pending: 1,
//   inactive: 0,
//   totalMembers: 10,
//   byType: { "null": 1 },
//   byProjectType: { "Residential": 1 }
// }
```

## Type Definitions

### Society Interface
```typescript
interface Society {
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
}
```

## Usage in Components

### Societies List Page
Location: `/src/pages/society-management/SocietiesList.tsx`

Features:
- Displays all societies with pagination
- Search by name, code, or contact person
- Filter by status (Active, Pending, Inactive)
- View, Edit, Delete actions
- Statistics cards showing total, active, pending societies and members

Example:
```typescript
import { SocietiesList } from './pages/society-management/SocietiesList';

// In your router
<Route path="/societies" element={<SocietiesList />} />
```

### Add/Edit Society Form
Location: `/src/pages/society-management/AddSociety.tsx`

Features:
- Multi-step form for creating/editing societies
- File upload support for documents
- Form validation
- Auto-generate society code

## API Response Format

### Success Response
```json
{
  "message": "Societies fetched successfully",
  "result": {
    "societies": [...],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Error Response
Errors are handled globally by the axios interceptor and will:
1. Display error message via toast notification
2. Redirect to login on 401/403 errors
3. Return Promise.reject with error message

## Authentication

The API requires authentication. The token is:
- Stored in `localStorage` with key `auth_token`
- Automatically added to all requests via axios interceptor
- Token format in Authorization header: `Bearer <token>` (without "Bearer" prefix as per backend requirement)

## Testing

To test the integration:

1. Ensure backend is running on `http://localhost:7001`
2. Set `VITE_API_URL` in `.env` file
3. Login to get authentication token
4. Navigate to `/societies` to see the societies list
5. Test search, filter, pagination features
6. Try creating a new society via `/societies/add`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured to allow `http://localhost:8080`
   - Check that backend is running

2. **401/403 Errors**
   - Verify authentication token is valid
   - Check token expiration
   - Re-login if necessary

3. **Network Errors**
   - Verify `VITE_API_URL` is correct
   - Check backend server is running on port 7001
   - Check network connectivity

4. **Type Errors**
   - All TypeScript types are defined in `/src/apis/societyApi.ts`
   - Import the `Society` interface for type safety

## Features Implemented

✅ Fetch societies with pagination
✅ Search societies
✅ Filter by status
✅ Sort by various fields
✅ View society details
✅ Create new society
✅ Update society
✅ Delete society (soft delete)
✅ Upload documents
✅ Generate society code
✅ Statistics dashboard
✅ Responsive design
✅ Loading states
✅ Error handling
✅ Toast notifications

## Next Steps

To extend the integration:

1. Add more filters (by city, project type, etc.)
2. Implement society view/detail page
3. Add export functionality (CSV/PDF)
4. Implement bulk operations
5. Add more statistics and charts
6. Implement real-time updates with WebSocket

