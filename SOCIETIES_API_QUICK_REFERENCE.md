# 🚀 Societies API Quick Reference Card

## 📍 Endpoints

### 1️⃣ Get Societies List
```
GET http://localhost:7001/admin/api/v1/societies?page=1&limit=10&search=&status=&sortBy=createdAt&sortOrder=DESC
```

### 2️⃣ Get Statistics
```
GET http://localhost:7001/admin/api/v1/societies/stats
```

---

## 💻 Frontend Usage

### Import
```typescript
import { getAllSocieties, getSocietyStats, Society } from '../../apis/societyApi';
```

### Fetch Societies
```typescript
const data = await getAllSocieties({
  page: 1,
  limit: 10,
  search: '',
  status: 'Pending',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
});

// Access data
data.societies        // Array<Society>
data.pagination.total // Total count
```

### Fetch Stats
```typescript
const stats = await getSocietyStats();

// Access data
stats.total           // Total societies
stats.active          // Active count
stats.pending         // Pending count
stats.inactive        // Inactive count
stats.totalMembers    // Total members
stats.byType          // { "null": 1 }
stats.byProjectType   // { "Residential": 1 }
```

---

## 📦 Response Structures

### Societies Response
```typescript
{
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
```

### Stats Response
```typescript
{
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
```

---

## 🔑 Authorization Header
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*Automatically added from localStorage by apiService.ts*

---

## 🎯 Available Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/societies` | SocietiesList | Main listing with filters |
| `/societies/add` | AddSociety | Create new society |
| `/societies/api-demo` | SocietiesAPIDemo | Test all API functions |
| `/societies/enquiries` | PendingEnquiries | View pending enquiries |

---

## ⚙️ Environment Setup
```env
# .env file
VITE_API_URL=http://localhost:7001/admin/api/v1
```

---

## 🎨 Common Patterns

### With Loading State
```typescript
const [loading, setLoading] = useState(false);
const [societies, setSocieties] = useState<Society[]>([]);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await getAllSocieties({ page: 1, limit: 10 });
    setSocieties(data.societies);
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### With Pagination
```typescript
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const fetchData = async () => {
  const data = await getAllSocieties({ page, limit: 10 });
  setSocieties(data.societies);
  setTotalPages(data.pagination.totalPages);
};

// Next page
<Button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
  Next
</Button>
```

### Display Stats Breakdown
```typescript
{Object.entries(stats.byProjectType).map(([type, count]) => (
  <div key={type}>
    <span>{type}</span>
    <span>{count} societies</span>
    <span>{(count / stats.total * 100).toFixed(1)}%</span>
  </div>
))}
```

---

## 🚨 Error Handling

Errors are automatically handled by `apiService.ts`:
- Shows toast notification
- Logs to console
- Redirects to login on 401/403

```typescript
try {
  const data = await getAllSocieties();
} catch (error: any) {
  // Error already handled by interceptor
  // Just display user-friendly message
  toast.error(error.message || 'Failed to fetch societies');
}
```

---

## 📱 Status Badge Colors

```typescript
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Active':   return 'bg-green-100 text-green-800';
    case 'Pending':  return 'bg-yellow-100 text-yellow-800';
    case 'Inactive': return 'bg-gray-100 text-gray-800';
    default:         return 'bg-gray-100 text-gray-800';
  }
};
```

---

## 🔍 Search & Filter Example

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('');

// Debounced search
useEffect(() => {
  const timer = setTimeout(() => {
    fetchSocieties();
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);

// Fetch with filters
const fetchSocieties = async () => {
  const data = await getAllSocieties({
    page: 1,
    limit: 10,
    search: searchTerm,
    status: filterStatus,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
};
```

---

## 📊 Stats Card Component

```typescript
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Total Societies</p>
      <p className="text-2xl font-bold">{stats.total}</p>
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <Building className="w-6 h-6 text-blue-600" />
    </div>
  </div>
</Card>
```

---

## ✅ Checklist

Before using the API:
- [ ] Backend running on port 7001
- [ ] Frontend running on port 8080
- [ ] `.env` file created with `VITE_API_URL`
- [ ] Logged in with valid auth token
- [ ] CORS configured on backend

---

## 🐛 Quick Debug

```typescript
// Check if API URL is set
console.log(import.meta.env.VITE_API_URL);

// Check if auth token exists
console.log(localStorage.getItem('auth_token'));

// Test API call
getAllSocieties({ page: 1, limit: 1 })
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err.message));
```

---

## 📚 Documentation Files

- `SOCIETIES_API_INTEGRATION.md` - Full integration guide
- `SOCIETIES_API_INTEGRATION_SUMMARY.md` - Complete summary
- `SOCIETIES_API_QUICK_REFERENCE.md` - This file

---

**Last Updated:** November 8, 2025  
**Status:** ✅ Production Ready

