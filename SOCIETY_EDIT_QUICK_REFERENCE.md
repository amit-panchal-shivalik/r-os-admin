# 🔧 Society Edit - Quick Reference

## 🚀 Quick Start

### 1. Navigate to Edit
```typescript
// From list page
navigate(`/societies/edit/${societyId}`);

// URL
http://localhost:8080/societies/edit/690f71c2c37f0538fa1be3e2
```

### 2. API Call
```typescript
import { updateSociety } from '../../apis/societyApi';

// Simple update
await updateSociety(societyId, {
  societyName: 'New Name',
  status: 'Active'
});

// With files
await updateSociety(societyId, data, {
  logo: newLogoFile,
  reraCertificate: newReraFile
});
```

## 📡 API Endpoint

```
PUT http://localhost:7001/admin/api/v1/societies/:id
```

**Content-Type:** `multipart/form-data` (when files included)

**Headers:**
```
Authorization: <token>
```

## 💻 Component Usage

### EditSociety Page
```typescript
// Auto-fetches data by ID from URL params
<Route path="societies/edit/:id" element={<EditSociety />} />

// Component flow:
// 1. Extract ID from useParams()
// 2. Fetch data with getSocietyById(id)
// 3. Pass to SocietySetupForm with mode='edit'
```

### SocietySetupForm with Edit Mode
```typescript
<SocietySetupForm 
  mode="edit"
  societyId="690f71c2c37f0538fa1be3e2"
  initialData={societyData}
/>
```

## 🎯 Key Functions

### Get Society By ID
```typescript
import { getSocietyById } from '../../apis/societyApi';

const society = await getSocietyById(id);
// Returns: Society object with all fields
```

### Update Society
```typescript
import { updateSociety } from '../../apis/societyApi';

// Partial update (only changed fields)
await updateSociety(id, {
  societyName: 'Updated Name',
  totalUnits: 150
});

// Full update with files
await updateSociety(id, fullData, files);
```

## 📋 What Gets Updated

### Text/Number Fields
```typescript
{
  societyName: string,
  description: string,
  totalUnits: number,
  totalBlocks: number,
  status: 'Active' | 'Pending' | 'Inactive'
}
```

### Nested Objects
```typescript
{
  address: {
    street: string,
    city: string,
    state: string,
    pincode: string
  },
  bankDetails: { ... },
  taxInformation: { ... }
}
```

### File Uploads (Optional)
```typescript
{
  logo: File,
  reraCertificate: File,
  fireNocDocument: File,
  buCertificate: File,
  liftLicenceDocument: File,
  gstCertificate: File
}
```

## 🔄 Edit Flow

```
Click Edit → Fetch Data → Pre-fill Form → Edit Fields → Submit → Update API → Success → Redirect
```

## ✅ Pre-filled Data

All these fields are automatically populated:

- ✅ Basic Info (name, code, description)
- ✅ Project Details (type, units, blocks, floors, dates)
- ✅ Contact (person, phone, email, address)
- ✅ Legal Documents (numbers and dates)
- ✅ Financial (bank, tax, FY)
- ✅ Settings (status, billing cycle)

## 📝 Form Validation

Same validation as create mode:
- Required fields marked with *
- Email format validation
- Phone number validation
- GST/PAN format validation
- Date validation
- File type validation

## 🎨 UI States

### Loading
```
[Spinner] Loading society details...
```

### Loaded
```
✏️ Edit Society & Project
[All fields pre-filled]
[Cancel] [Update Society]
```

### Submitting
```
[Update Society] ← disabled with spinner
```

### Success
```
✅ Society/Project updated successfully!
→ Navigate to /societies
```

### Error
```
❌ Failed to update society. Please try again.
```

## 🔍 Testing Checklist

- [ ] Can navigate to edit page
- [ ] Data loads and pre-fills form
- [ ] Can edit text fields
- [ ] Can change dropdowns/selects
- [ ] Can update dates
- [ ] Can upload new files
- [ ] Validation works
- [ ] Can submit successfully
- [ ] Success toast shows
- [ ] Redirects to list
- [ ] Changes are saved
- [ ] Can edit again and see updates

## 🐛 Common Issues

### 1. Data not loading
```typescript
// Check: Is society ID valid?
console.log('Society ID:', id);

// Check: Is API responding?
curl http://localhost:7001/admin/api/v1/societies/:id \
  -H "Authorization: YOUR_TOKEN"
```

### 2. Form not pre-filling
```typescript
// Check: Is initialData passed?
console.log('Initial Data:', initialData);

// Check: Is enableReinitialize true?
<Formik enableReinitialize={true} ... />
```

### 3. Update not working
```typescript
// Check: Is societyId available?
console.log('Society ID for update:', societyId);

// Check: Is update API being called?
console.log('Mode:', mode); // Should be 'edit'
```

## 💡 Pro Tips

1. **Partial Updates:** Only send changed fields for better performance
2. **File Uploads:** Files are optional - existing files are retained if not replaced
3. **Date Format:** Use `YYYY-MM-DD` format for date inputs
4. **Validation:** Form validates on blur and on submit
5. **Navigation:** Cancel button goes back to /societies
6. **Error Handling:** All errors show user-friendly toast messages

## 📚 Related Files

- `EditSociety.tsx` - Edit page component
- `SocietySetupForm.tsx` - Shared form (create/edit)
- `societyApi.ts` - API functions
- `AppRoutes.tsx` - Route definitions

## 🎯 Quick Example

Complete edit example:

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { getSocietyById, updateSociety } from '../../apis/societyApi';

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. Fetch data
  const [society, setSociety] = useState(null);
  useEffect(() => {
    getSocietyById(id).then(setSociety);
  }, [id]);
  
  // 2. Handle update
  const handleUpdate = async (formData) => {
    await updateSociety(id, formData);
    toast.success('Updated!');
    navigate('/societies');
  };
  
  // 3. Render form
  return society ? (
    <SocietySetupForm 
      mode="edit"
      societyId={id}
      initialData={society}
    />
  ) : (
    <Loading />
  );
};
```

---

**Status:** ✅ Fully Implemented and Working

For detailed documentation, see `SOCIETY_EDIT_FEATURE.md`

