# 🔧 Society Edit Feature - Complete Integration

## ✅ What's Been Implemented

The **Edit Society** feature has been fully integrated into the frontend application with complete API integration, data pre-filling, and file upload support.

## 📁 Files Created/Modified

### New Files
1. ✅ `/r-os-admin/src/pages/society-management/EditSociety.tsx` - Edit page component

### Modified Files
2. ✅ `/r-os-admin/src/pages/society-management/SocietySetupForm.tsx` - Enhanced to support both create and edit modes
3. ✅ `/r-os-admin/src/routing/AppRoutes.tsx` - Added edit route
4. ✅ `/r-os-admin/src/apis/societyApi.ts` - Already has `updateSociety()` function

## 🚀 How It Works

### 1. Navigation to Edit Page
From the societies list, click the **Edit** button (pencil icon) on any society card:

```typescript
// In SocietiesList.tsx
const handleEdit = (id: string) => {
  navigate(`/societies/edit/${id}`);
};
```

### 2. Data Loading
The Edit page fetches the society data by ID:

```typescript
// EditSociety.tsx
const { id } = useParams<{ id: string }>();
const data = await getSocietyById(id);
```

### 3. Form Pre-filling
All form fields are automatically pre-filled with existing data:

- Basic Information (name, code, description)
- Project Details (type, units, blocks, floors, dates)
- Contact Information (person, phone, email, address)
- Legal Documents (RERA, Fire NOC, certificates with numbers and dates)
- Financial Setup (bank details, tax information, financial year)
- Additional Settings (status, billing cycle)

### 4. Data Editing
Users can modify any field. The form validates all changes.

### 5. File Upload (Optional)
- Existing documents are retained if no new file is uploaded
- Upload new files to replace existing documents
- Supported formats: PDF, JPG, JPEG, PNG

### 6. Form Submission
On submit, the form calls the Update API:

```typescript
if (mode === 'edit' && societyId) {
  await updateSociety(societyId, societyData, files);
  toast.success('Society/Project updated successfully!');
}
```

## 🎯 API Integration

### Update Society API
**Endpoint:** `PUT /admin/api/v1/societies/:id`

**Usage:**
```typescript
import { updateSociety } from '../../apis/societyApi';

// Update with data only
await updateSociety(societyId, {
  societyName: 'Updated Name',
  status: 'Active',
  totalUnits: 150
});

// Update with new files
await updateSociety(societyId, societyData, {
  logo: newLogoFile,
  reraCertificate: newReraFile
});
```

**Function Signature:**
```typescript
export const updateSociety = async (
  id: string,
  data: Partial<SocietyData>,
  files?: Record<string, File>
): Promise<any>
```

**Features:**
- Supports partial updates (only changed fields)
- Multipart/form-data for file uploads
- Nested objects handling (address, bankDetails, etc.)
- Optional file uploads

## 📱 User Experience

### Loading State
While fetching society data:
```
┌──────────────────────────┐
│  [Spinner Animation]     │
│  Loading society         │
│  details...              │
└──────────────────────────┘
```

### Edit Form
Pre-filled form with all existing data:
```
┌────────────────────────────────────┐
│  Edit Society & Project            │
│  Update society/project information│
│                                    │
│  [Tab: Basic Info] [Project]...   │
│                                    │
│  Society Name: Test Society ───┐  │
│  Society Code: SOC-2025-042    │  │
│  Description: ...              │  │
│  [All fields pre-filled]       │  │
│                                │  │
│  [Cancel]     [Update Society] │  │
└────────────────────────────────────┘
```

### Success State
After successful update:
```
✅ Society/Project updated successfully!
→ Redirects to /societies
```

## 🔄 Data Flow

```
User clicks Edit button on society card
           ↓
Navigate to /societies/edit/:id
           ↓
EditSociety component loads
           ↓
Fetch society data by ID (getSocietyById)
           ↓
Pass data to SocietySetupForm with mode='edit'
           ↓
Form initialized with existing data
           ↓
User modifies fields
           ↓
User submits form
           ↓
updateSociety(id, data, files) called
           ↓
Backend processes update
           ↓
Success toast shown
           ↓
Redirect to /societies
```

## 💻 Code Examples

### 1. Simple Update (Text Fields Only)
```typescript
import { updateSociety } from '../../apis/societyApi';

const handleQuickUpdate = async (societyId: string) => {
  try {
    await updateSociety(societyId, {
      societyName: 'New Name',
      description: 'Updated description',
      status: 'Active',
      totalUnits: 120
    });
    toast.success('Updated!');
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

### 2. Update with Nested Objects
```typescript
await updateSociety(societyId, {
  address: {
    street: 'New Street',
    city: 'New City',
    state: 'New State',
    pincode: '654321'
  },
  bankDetails: {
    bankName: 'New Bank',
    accountNumber: '9876543210',
    ifscCode: 'NEWB0001234'
  }
});
```

### 3. Update with Files
```typescript
const files = {
  logo: newLogoFile,
  reraCertificate: newReraFile,
  gstCertificate: newGstFile
};

await updateSociety(societyId, societyData, files);
```

### 4. Conditional Update
```typescript
const updateOnlyIfChanged = async (original: Society, modified: Society) => {
  const changes: Partial<SocietyData> = {};
  
  if (original.societyName !== modified.societyName) {
    changes.societyName = modified.societyName;
  }
  
  if (original.status !== modified.status) {
    changes.status = modified.status;
  }
  
  if (Object.keys(changes).length > 0) {
    await updateSociety(original._id, changes);
  }
};
```

## 🎨 Features

### ✅ Complete Feature List

**Data Loading:**
- ✅ Fetch society by ID
- ✅ Loading state with spinner
- ✅ Error handling with redirect
- ✅ Auto-redirect if society not found

**Form Handling:**
- ✅ Pre-fill all form fields
- ✅ Support for text inputs
- ✅ Support for select/dropdowns
- ✅ Support for date inputs
- ✅ Support for file uploads
- ✅ Nested object handling (address, bank details, etc.)
- ✅ Form validation
- ✅ Real-time validation feedback

**File Management:**
- ✅ Retain existing documents if not replaced
- ✅ Upload new documents
- ✅ Support multiple file types
- ✅ File upload progress indication

**User Feedback:**
- ✅ Loading spinner during fetch
- ✅ Success toast on update
- ✅ Error toast on failure
- ✅ Form validation errors
- ✅ Disabled state during submission

**Navigation:**
- ✅ Proper routing (/societies/edit/:id)
- ✅ Breadcrumb support
- ✅ Cancel button (navigates back)
- ✅ Auto-redirect after success

## 🛣️ Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/societies` | SocietiesList | List all societies |
| `/societies/add` | AddSociety | Create new society |
| `/societies/edit/:id` | EditSociety | Edit existing society |
| `/societies/api-demo` | SocietiesAPIDemo | API testing page |

## 📊 Form Modes

The `SocietySetupForm` component now supports two modes:

```typescript
// Create Mode (default)
<SocietySetupForm />
<SocietySetupForm mode="create" />

// Edit Mode
<SocietySetupForm 
  mode="edit" 
  societyId="690f71c2c37f0538fa1be3e2"
  initialData={societyData}
/>
```

**Mode Differences:**

| Feature | Create Mode | Edit Mode |
|---------|-------------|-----------|
| Title | "Society & Project Setup" | "Edit Society & Project" |
| Code Generation | Auto-generate new code | Use existing code |
| Initial Values | Empty form | Pre-filled with data |
| Submit Action | `createSociety()` | `updateSociety()` |
| Success Message | "created successfully" | "updated successfully" |
| Files | All required | Optional (keep existing) |

## 🧪 Testing the Edit Feature

### Manual Testing Steps

1. **Navigate to Societies List**
   ```
   http://localhost:8080/societies
   ```

2. **Click Edit Button**
   - Find any society card
   - Click the green pencil icon
   - Should navigate to `/societies/edit/:id`

3. **Verify Data Loading**
   - Loading spinner should appear
   - Form should load with pre-filled data
   - All tabs should have correct information

4. **Make Changes**
   - Edit some fields (e.g., change society name)
   - Upload a new document (optional)
   - Verify validation works

5. **Submit Form**
   - Click "Update Society" button
   - Should show success toast
   - Should redirect to `/societies`
   - Changes should be visible in the list

6. **Verify Update**
   - Find the updated society in the list
   - Click Edit again
   - Verify changes were saved

### API Testing with curl

```bash
# Update society name and status
curl -X PUT 'http://localhost:7001/admin/api/v1/societies/690f71c2c37f0538fa1be3e2' \
  -H 'Authorization: YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "societyName": "Updated Name",
    "status": "Active"
  }'
```

## 🐛 Error Handling

The edit feature handles these error scenarios:

1. **Society Not Found (404)**
   ```typescript
   toast.error('Society not found');
   navigate('/societies');
   ```

2. **Unauthorized (401)**
   ```typescript
   // Auto-handled by axios interceptor
   localStorage.removeItem('auth_token');
   window.location.href = '/login';
   ```

3. **Validation Error (400)**
   ```typescript
   toast.error('Please check all required fields');
   // Form shows field-specific errors
   ```

4. **Network Error**
   ```typescript
   toast.error('Network error. Please check your connection.');
   ```

5. **Invalid Society ID**
   ```typescript
   toast.error('Society ID is required');
   navigate('/societies');
   ```

## 📝 Notes

### Date Formatting
Dates are formatted for HTML date inputs:
```typescript
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};
```

### File Handling
- Files are **not** pre-loaded into the form (security/performance)
- User must re-upload files to update them
- If no new file is uploaded, existing file URL is retained
- Files are sent as multipart/form-data

### Nested Objects
Nested objects (address, bankDetails, etc.) are flattened in the form:
```typescript
// Form fields
address: string  // street
city: string
state: string
pincode: string

// API payload
address: {
  street: formValues.address,
  city: formValues.city,
  state: formValues.state,
  pincode: formValues.pincode
}
```

## ✅ Summary

**Status: Edit Feature Complete and Working** 🎉

✅ EditSociety page created  
✅ SocietySetupForm enhanced for edit mode  
✅ Route added (/societies/edit/:id)  
✅ API integration complete  
✅ Data pre-filling working  
✅ File upload support (optional)  
✅ Error handling implemented  
✅ Loading states added  
✅ Success/error toasts  
✅ Validation working  
✅ Navigation flows complete  

The edit feature is fully functional and ready for production use!

## 🚀 Next Steps (Optional Enhancements)

1. Add society view-only page (/societies/view/:id)
2. Implement change history/audit log
3. Add "Revert Changes" button
4. Add file preview before upload
5. Implement auto-save draft feature
6. Add bulk edit functionality
7. Implement version control for documents
8. Add comparison view (before/after changes)

