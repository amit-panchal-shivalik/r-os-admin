# R-OS Admin Dashboard - Complete Documentation

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38BDF8?logo=tailwind-css&logoColor=white)
![Mantine v8](https://img.shields.io/badge/Mantine-8.1.3-339AF0?logo=mantine&logoColor=white)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technical Architecture](#-technical-architecture)
3. [Getting Started](#-getting-started)
4. [Project Structure](#-project-structure)
5. [Authentication & Authorization](#-authentication--authorization)
6. [Core Features](#-core-features)
7. [Component Library](#-component-library)
8. [State Management](#-state-management)
9. [API Integration](#-api-integration)
10. [Routing System](#-routing-system)
11. [Styling & Theming](#-styling--theming)
12. [Development Guidelines](#-development-guidelines)
13. [Build & Deployment](#-build--deployment)
14. [Environment Configuration](#-environment-configuration)
15. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

### What is R-OS?

**R-OS (Real Estate Operations System)** is an enterprise-grade admin dashboard designed for comprehensive real estate management. It empowers property managers, agents, and real estate enterprises with real-time analytics, intuitive UI, and seamless backend integration.

### Key Objectives

- **Multi-tenant Management**: Support multiple organizations with role-based access
- **Real-time Operations**: Live tracking of leads, projects, and territories
- **Scalable Architecture**: Built to handle enterprise-level data
- **Modern UX**: Intuitive interface with responsive design
- **Comprehensive CRM**: End-to-end customer relationship management

### Target Users

- **Super Admins**: Full system access and control
- **Land Managers/Executives**: Territory and land management
- **Sales Teams**: Lead tracking and conversion
- **HR Department**: Employee and attendance management
- **Campaign Managers**: Marketing campaign execution
- **Channel Partners**: Partner relationship management

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend Core
```json
{
  "React": "18.3.1",
  "TypeScript": "5.5.3",
  "Vite": "5.4.1"
}
```

#### State Management
- **Redux Toolkit**: 2.8.2 - Modern Redux with less boilerplate
- **Redux Saga**: 1.3.0 - Side effect management
- **React Context**: Auth and theme management

#### UI Frameworks
- **Mantine UI v8**: 8.1.3 - Primary component library
- **Radix UI**: Accessible primitives (50+ components)
- **Tailwind CSS**: 3.4.11 - Utility-first styling
- **Lucide React**: Icon system
- **Tabler Icons**: Additional icon set

#### Form Management
- **React Hook Form**: 7.53.0 - Performant form handling
- **Yup**: Schema validation
- **Zod**: TypeScript-first schema validation

#### HTTP & Data Fetching
- **Axios**: 1.10.0 - HTTP client with interceptors
- **TanStack Query**: 5.56.2 - Server state management

#### Additional Libraries
- **React Router DOM**: 6.26.2 - Client-side routing
- **Date-fns**: 3.6.0 - Date manipulation
- **Moment.js**: 2.30.1 - Date formatting
- **Google Maps API**: Map integration
- **SweetAlert2**: Beautiful alerts
- **React QR Code**: QR generation
- **Chart.js**: Data visualization
- **Recharts**: React charting library

### Architecture Pattern

```
┌─────────────────────────────────────────┐
│           User Interface (React)        │
├─────────────────────────────────────────┤
│      Component Layer (Mantine + UI)    │
├─────────────────────────────────────────┤
│   State Management (Redux + Saga)      │
├─────────────────────────────────────────┤
│     API Layer (Axios + Interceptors)   │
├─────────────────────────────────────────┤
│          Backend API (REST)             │
└─────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js: >= 18.x
npm: >= 9.x
Git: Latest version
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd r-os-admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your configuration
VITE_API_URL=your_api_url_here
```

4. **Start development server**
```bash
npm run dev
```

The application will start at `http://localhost:8080`

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 8080)

# Build
npm run build           # Production build
npm run build:dev       # Development build
npm run build:staging   # Staging build

# Code Quality
npm run lint            # Run ESLint

# Preview
npm run preview         # Preview production build
```

---

## 📁 Project Structure

```
r-os-admin/
├── public/                      # Static assets
│   ├── authBgImage.svg         # Login background
│   ├── loginIcon.svg           # Login icon
│   ├── placeholder.svg         # Placeholder images
│   └── robots.txt              # SEO configuration
│
├── src/
│   ├── apis/                   # API configuration
│   │   ├── apiService.ts       # Axios instance & interceptors
│   │   ├── apiRequest.ts       # Generic API wrapper
│   │   └── auth.ts             # Authentication APIs
│   │
│   ├── components/
│   │   ├── CustomInput/        # Custom form inputs (17 components)
│   │   │   ├── TextInput.tsx
│   │   │   ├── SelectInput.tsx
│   │   │   ├── DateInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── PaginatedSelect.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Icon/               # Icon components (162 icons)
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   └── ui/                 # UI primitives (50+ components)
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.tsx         # Authentication hook
│   │   ├── use-mobile.tsx      # Responsive hook
│   │   └── use-toast.ts        # Toast notifications
│   │
│   ├── pages/                  # Route-level pages
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── OtpPage.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   │
│   ├── routing/                # Routing configuration
│   │   ├── AppRoutes.tsx       # Main router
│   │   ├── PrivateRoute.tsx    # Protected routes
│   │   └── PublicRoute.tsx     # Public routes
│   │
│   ├── store/                  # Redux store
│   │   ├── slices/             # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── otpSlice.ts
│   │   │   └── themeConfigSlice.tsx
│   │   │
│   │   ├── sagas/              # Redux sagas
│   │   │   ├── authSaga.ts
│   │   │   ├── otpSaga.ts
│   │   │   └── rootSaga.ts
│   │   │
│   │   └── store.ts            # Store configuration
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── CommonTypes.ts
│   │   ├── CustomInputTypes.ts
│   │   ├── LoginTypes.ts
│   │   └── OTPTypes.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── Context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── UseDebounce.tsx
│   │   │   └── UseScreenSize.tsx
│   │   ├── Constant.ts         # Constants & options
│   │   ├── localstorage.ts     # Storage helpers
│   │   └── validationSchemas.ts
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # Vite types
│
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind configuration
├── vite.config.ts              # Vite configuration
├── theme.config.tsx            # Theme settings
└── README.md                   # Project README
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │ --> │ Send OTP │ --> │ Verify   │ --> │Dashboard │
│  Page    │     │          │     │   OTP    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### OTP-Based Login

1. **User enters mobile number** (10-digit Indian number)
2. **System sends OTP** via SMS
3. **User verifies OTP**
4. **System issues JWT token**
5. **Token stored in localStorage**
6. **Auto-redirect to dashboard**

### Token Management

```typescript
// Token stored in localStorage
localStorage.setItem('auth_token', token);
localStorage.setItem('userInfo', JSON.stringify(userData));

// Axios interceptor adds token to all requests
config.headers.Authorization = token;

// Auto-logout on 401/403
if (status === 401 || status === 403) {
  localStorage.clear();
  window.location.href = '/';
}
```

### Role-Based Access Control (RBAC)

#### Available Roles

| Role | Access Level | Key Modules |
|------|--------------|-------------|
| `SuperAdmin` | Full Access | All modules |
| `LandManager` | Desk, Territory | Land management |
| `LandExecutive` | Desk, Territory | Land operations |
| `FundManager` | Desk | Fund tracking |
| `FundExecutive` | Desk | Fund operations |
| `ProjectSalesManager` | Desk | Sales management |
| `ProjectPreSales` | Desk | Pre-sales |
| `ProjectSiteSales` | Desk | Site sales |
| `EventAdmin` | Event | Event management |
| `KnowledgeAdmin` | Knowledge | Knowledge base |
| `CPManager` | Desk, Channel Sales | Partner management |
| `CPExecutive` | Desk, Channel Sales | Partner operations |
| `CampaignAdmin` | Campaign | Campaign execution |
| `VendorAdmin` | Territory | Vendor management |
| `HRManager` | Employee | HR management |
| `HRExecutive` | Employee | HR operations |
| `FurnitureManager` | Desk, Territory | Furniture sales |
| `FurnitureSalesExecutive` | Desk, Territory | Furniture operations |
| `GrowthPartnerAdmin` | Growth Partner | Partner growth |
| `InstituteManager` | Desk | Institute management |
| `InstituteExecutive` | Desk | Institute operations |

#### Role Implementation

```typescript
// Get user roles from localStorage
const getUserRoles = (): string[] => {
  const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
  return Array.isArray(info.userRoles) ? info.userRoles : ['Guest'];
};

// Filter navigation based on roles
const getFilteredNavigation = (roles: string[]) => {
  if (roles.includes('SuperAdmin')) return allNavigation;
  // Filter based on role permissions
};
```

---

## 🎨 Core Features

### 1. People Management

**Purpose**: Manage users, contacts, and stakeholders

**Features**:
- User listing with search & filter
- User profile management
- Contact information
- Activity tracking
- User roles assignment

**Route**: `/users`

**Access**: All authenticated users

---

### 2. Territory Module

Comprehensive territory and property management system.

#### 2.1 Dashboard
- Territory overview
- Key metrics and analytics
- Quick actions

**Route**: `/territory/dashboard`

#### 2.2 Projects
- Project listing and management
- Project details and documentation
- Timeline tracking
- Unit management

**Route**: `/territory/project`

**Key Features**:
- Project type: Residential, Commercial, Mixed-Use, Plotting
- Status tracking: Upcoming, Under Construction, Ready to Move
- Unit types: 1BHK, 2BHK, 3BHK, 4BHK, Shops, Office, Plot
- Amenities management
- Payment plans (CLP, Subvention, Down Payment, Flexi)
- Bank approvals
- Visibility control (Published, Draft, Hidden, Pending)

#### 2.3 Land Management
- Land inquiry tracking
- 13-stage inquiry pipeline
- Location mapping with Google Maps
- Document management
- Verification workflow

**Route**: `/territory/land/dashboard`

**Inquiry Stages**:
1. Inquiry In
2. Shortlisted
3. Rejected
4. T&C
5. Proposal
6. Title Clearance
7. District Mapping
8. Contour Survey
9. Team Survey
10. Field Survey
11. Team Visit
12. Development Type
13. Agreement

**Land Details**:
- Location & Google Maps integration
- Purpose: JV, Sale, Joint Development
- Area with multiple units (Sq Yards, Sq Mtr, Bigha, Acre)
- Survey numbers
- TP Name & Number
- Plot numbers
- Zone classification
- User type: Land Owner, Broker, Developer
- Land type: Agriculture, Non-Agriculture

#### 2.4 Vendor Management
- Vendor listing
- Vendor categories
- Performance tracking
- Contract management

**Route**: `/territory/vendor/dashboard`

#### 2.5 Store Management
- Store inventory
- Product management
- Order tracking
- Sales analytics

**Route**: `/territory/store/dashboard`

**Access**: Furniture roles

#### 2.6 Institute Management
- Institute listing
- Program management
- Enrollment tracking

**Route**: `/territory/institute/dashboard`

---

### 3. Desk Module

**Purpose**: Lead management and follow-up system

**Features**:
- Lead tracking dashboard
- Follow-up scheduler
- Activity logging
- Conversion tracking
- Lead source analysis

**Route**: `/follow-up`

**Access**: Most roles have access

---

### 4. Event Management

**Purpose**: Organize and manage real estate events

**Features**:
- Event creation and scheduling
- Attendee management
- Event calendar view
- Registration tracking
- Event analytics

**Route**: `/event`

**Access**: EventAdmin, SuperAdmin

---

### 5. Knowledge Base

**Purpose**: Centralized documentation and articles

**Features**:
- Article listing
- Rich text editor (React Quill)
- Category management
- Search functionality
- Version control

**Route**: `/article-listing`

**Access**: KnowledgeAdmin, SuperAdmin

---

### 6. Channel Sales

**Purpose**: Partner and channel partner management

**Features**:
- Partner listing
- Commission tracking
- Performance metrics
- Deal management
- Partner onboarding

**Route**: `/channel-sales`

**Access**: CPManager, CPExecutive, SuperAdmin

---

### 7. Campaign System

**Purpose**: Multi-channel marketing campaigns

**Features**:
- Campaign creation
- Multi-channel support (Email, WhatsApp, SMS)
- Lead type selection (CP, CRM, Excel)
- CRM integration (Project, Fund, Furniture)
- Campaign analytics
- Template management

**Routes**:
- `/campaign-list` - Campaign listing
- `/campaign-add` - Create campaign

**Campaign Types**:
- Email campaigns
- WhatsApp broadcasts
- SMS messaging

**Lead Sources**:
- Channel Partners (CP)
- CRM Database
- Excel imports

---

### 8. Employee Management

Comprehensive HR and employee management system.

#### 8.1 Dashboard
- Employee overview
- Attendance summary
- Department analytics

**Route**: `/employee/dashboard`

#### 8.2 Employee List
- Employee directory
- Profile management
- Role assignment
- Status tracking

**Route**: `/employee/employee-list`

#### 8.3 Designation Management
- Job titles and roles
- Hierarchy management
- Permission mapping

**Route**: `/employee/designation`

#### 8.4 Department Management
- Department structure
- Team organization
- Department heads

**Route**: `/employee/department`

#### 8.5 Branch Management
- Office locations
- Branch details
- Regional management

**Route**: `/employee/branch`

#### 8.6 Seating Office
- Seat allocation
- Office layouts
- Space management

**Route**: `/employee/seating-office`

#### 8.7 Shift Management
- Shift schedules
- Rotation management
- Shift patterns

**Route**: `/employee/shift-management`

#### 8.8 Jobs
- Job postings
- Recruitment tracking
- Application management

**Route**: `/employee/jobs`

#### 8.9 Reports
- Employee reports
- Attendance reports
- Performance metrics

**Route**: `/employee/report`

**Access**: HRManager, HRExecutive, SuperAdmin

---

### 9. Feedback System

**Purpose**: Collect and manage user feedback

**Features**:
- Module-wise feedback
- Feedback categories
- Response tracking
- Analytics dashboard

**Routes**:
- `/feedback-modules-list` - Feedback modules (SuperAdmin only)
- `/feedback-list` - Feedback listing (All users)

**Access**: All users can submit feedback, SuperAdmin manages modules

---

### 10. Growth Partner Program

**Purpose**: Manage growth partners and affiliates

**Features**:
- Partner listing
- Performance tracking
- Commission management
- Referral tracking

**Route**: `/growth-partner-list`

**Access**: GrowthPartnerAdmin, SuperAdmin

---

## 🧩 Component Library

### Custom Input Components (17 Total)

Located in `src/components/CustomInput/`

#### Text Inputs
```typescript
// TextInput.tsx
<TextInput
  label="First Name"
  placeholder="Enter first name"
  value={value}
  onChange={handleChange}
  error={error}
  required
/>

// TextareInput.tsx
<TextareInput
  label="Description"
  rows={4}
  placeholder="Enter description"
/>

// SearchInput.tsx
<SearchInput
  placeholder="Search..."
  onSearch={handleSearch}
  debounceDelay={300}
/>
```

#### Select Inputs
```typescript
// SelectInput.tsx
<SelectInput
  label="Status"
  options={statusOptions}
  value={selectedStatus}
  onChange={handleStatusChange}
/>

// ReactSelectInput.tsx
<ReactSelectInput
  label="Project"
  options={projectOptions}
  isMulti
  isClearable
/>

// PaginatedSelect.tsx
<PaginatedSelect
  label="Select User"
  fetchOptions={fetchUsers}
  onChange={handleUserSelect}
/>

// CountryDropDown.tsx
<CountryDropDown
  value={country}
  onChange={handleCountryChange}
/>
```

#### Date & Time
```typescript
// DateInput.tsx
<DateInput
  label="Start Date"
  value={date}
  onChange={handleDateChange}
  minDate={new Date()}
/>
```

#### File Uploads
```typescript
// FileUpload.tsx
<FileUpload
  label="Upload Document"
  accept=".pdf,.doc,.docx"
  maxSize={5} // MB
  onUpload={handleUpload}
/>

// MultiUpload.tsx
<MultiUpload
  label="Upload Images"
  accept="image/*"
  maxFiles={10}
  onUpload={handleMultiUpload}
/>

// FileUploadInputs.tsx
<FileUploadInputs
  fields={documentFields}
  values={documents}
  onChange={handleDocChange}
/>
```

#### Form Controls
```typescript
// CheckBoxGroup.tsx
<CheckBoxGroup
  label="Amenities"
  options={amenitiesOptions}
  value={selectedAmenities}
  onChange={handleAmenitiesChange}
/>

// RadioGroup.tsx
<RadioGroup
  label="Property Type"
  options={propertyTypes}
  value={selectedType}
  onChange={handleTypeChange}
/>
```

#### Specialized Inputs
```typescript
// MasterFieldSelect.tsx
<MasterFieldSelect
  type="Status"
  label="Project Status"
  isMulti={false}
  onChange={handleMasterChange}
/>

// PaginatedProjectSelect.tsx
<PaginatedProjectSelect
  label="Select Project"
  onChange={handleProjectSelect}
/>
```

#### Pagination
```typescript
// Pagination.tsx
<Pagination
  totalItems={1000}
  itemsPerPage={12}
  currentPage={page}
  onPageChange={handlePageChange}
/>
```

### UI Primitives (50+ Components)

Located in `src/components/ui/`

#### Buttons & Actions
- `button.tsx` - Customizable button component
- `toggle.tsx` - Toggle switch
- `toggle-group.tsx` - Toggle button group
- `switch.tsx` - On/off switch

#### Layout
- `card.tsx` - Card container
- `separator.tsx` - Visual separator
- `accordion.tsx` - Collapsible sections
- `tabs.tsx` - Tab navigation
- `resizable.tsx` - Resizable panels
- `sidebar.tsx` - Navigation sidebar

#### Overlays
- `dialog.tsx` - Modal dialogs
- `alert-dialog.tsx` - Confirmation dialogs
- `sheet.tsx` - Slide-out panel
- `drawer.tsx` - Drawer component
- `popover.tsx` - Popover overlay
- `tooltip.tsx` - Hover tooltips
- `hover-card.tsx` - Rich hover content
- `context-menu.tsx` - Right-click menu
- `dropdown-menu.tsx` - Dropdown menus
- `menubar.tsx` - Menu bar

#### Forms
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio buttons
- `slider.tsx` - Range slider
- `input-otp.tsx` - OTP input
- `form.tsx` - Form wrapper with validation
- `label.tsx` - Form labels
- `command.tsx` - Command palette

#### Data Display
- `table.tsx` - Data tables
- `avatar.tsx` - User avatars
- `badge.tsx` - Status badges
- `alert.tsx` - Alert messages
- `toast.tsx` - Toast notifications
- `progress.tsx` - Progress bars
- `skeleton.tsx` - Loading skeletons
- `chart.tsx` - Chart wrapper

#### Navigation
- `navigation-menu.tsx` - Navigation menu
- `breadcrumb.tsx` - Breadcrumb trail
- `pagination.tsx` - Page navigation

#### Media
- `carousel.tsx` - Image carousel
- `aspect-ratio.tsx` - Aspect ratio container

#### Utility
- `scroll-area.tsx` - Scrollable container
- `collapsible.tsx` - Collapsible content

#### Custom Components
- `PageHeader.tsx` - Standardized page header
- `StatsCard.tsx` - Statistics card
- `EntityCard.tsx` - Entity display card
- `DetailsSidebar.tsx` - Details panel

### Custom UI Components Usage

```typescript
// PageHeader
import { PageHeader } from '@/components/ui/PageHeader';

<PageHeader
  title="Employee Management"
  subtitle="Manage your team members"
  actions={
    <Button onClick={handleAdd}>
      Add Employee
    </Button>
  }
/>

// StatsCard
import { StatsCard } from '@/components/ui/StatsCard';

<StatsCard
  title="Total Inquiries"
  value={3}
  icon={<IconUsers />}
  trend="+12%"
  bgColor="bg-blue-100"
/>

// EntityCard
import { EntityCard } from '@/components/ui/EntityCard';

<EntityCard
  title="Project Name"
  description="Project details"
  image="/project.jpg"
  status="Active"
  onClick={handleView}
/>
```

---

## 🗄️ State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    status: 'idle' | 'pending' | 'complete' | 'failed',
    error: string | null
  },
  otp: {
    // OTP state
  }
}
```

### Redux Slices

#### Auth Slice (`authSlice.ts`)

```typescript
// Actions
loginUser(payload)           // Start login
loginUserSuccess(payload)    // Login success
loginUserFailure(payload)    // Login failed
resetLoginUser()             // Reset state

// Usage
import { loginUser } from '@/store/slices/authSlice';

dispatch(loginUser({ countryCode: '+91', phoneNumber: '9876543210' }));
```

#### OTP Slice (`otpSlice.ts`)

```typescript
// OTP verification actions
verifyOTP(payload)
verifyOTPSuccess(payload)
verifyOTPFailure(payload)
resetVerifyOTP()
```

### Redux Saga Side Effects

#### Auth Saga (`authSaga.ts`)

```typescript
// Watches for login action
function* handleLogin(action) {
  try {
    const response = yield call(authenticateUserApi, action.payload);
    yield put(loginUserSuccess(response));
  } catch (error) {
    yield put(loginUserFailure(error.message));
  }
}
```

#### OTP Saga (`otpSaga.ts`)

```typescript
// Watches for OTP verification
function* handleVerifyOTP(action) {
  try {
    const response = yield call(verifyOTPApi, action.payload);
    // Store token and user data
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('userInfo', JSON.stringify(response.user));
    yield put(verifyOTPSuccess(response));
  } catch (error) {
    yield put(verifyOTPFailure(error.message));
  }
}
```

### React Context

#### Auth Context (`useAuth.tsx`)

```typescript
const { isAuthenticated, user, login, logout, updateUser } = useAuth();

// Login
login(userData, token);

// Logout
logout();

// Update user
updateUser({ name: 'New Name' });

// Check authentication
if (isAuthenticated) {
  // User is logged in
}
```

---

## 🌐 API Integration

### Axios Configuration

#### API Service (`apiService.ts`)

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000, // 2 minutes
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    config.headers.Authorization = authToken.replace(/^"|"$/g, '').trim();
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### Generic API Request

```typescript
// apiRequest.ts
export const apiRequest = async <T>(config: any): Promise<T> => {
  const response = await apiClient.request<T>(config);
  return response.data;
};

// Usage
const data = await apiRequest({
  method: 'GET',
  url: '/users',
  params: { page: 1, limit: 10 }
});
```

### Auth APIs

```typescript
// Login - Send OTP
const response = await apiRequest({
  method: 'POST',
  url: 'users/admin/send-phone-otp',
  data: { countryCode: '+91', phoneNumber: '9876543210' }
});

// Verify OTP
const response = await apiRequest({
  method: 'POST',
  url: 'users/admin/verify-phone-otp',
  data: { phoneNumber: '9876543210', otp: '123456' }
});
```

### API Response Handling

```typescript
// Success Response
{
  success: true,
  data: { ... },
  message: "Success message"
}

// Error Response
{
  success: false,
  message: "Error message",
  errors: { ... }
}
```

---

## 🛣️ Routing System

### Route Configuration

```typescript
// AppRoutes.tsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
  <Route path="/otp" element={<PublicRoute><OtpPage /></PublicRoute>} />

  {/* Private Routes */}
  <Route path="/*" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
    <Route index element={<RedirectByRole />} />
    {/* Nested routes render inside DashboardLayout */}
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Route Guards

#### Private Route
```typescript
// PrivateRoute.tsx
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

#### Public Route
```typescript
// PublicRoute.tsx
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};
```

### Role-Based Redirects

```typescript
// RedirectByRole component
const RedirectByRole = () => {
  const roles = getUserRoles();
  
  // Role to default route mapping
  const ROLE_DEFAULTS = {
    SuperAdmin: '/users',
    LandManager: '/territory/land/dashboard',
    HRManager: '/employee/dashboard'
  };
  
  for (const role of roles) {
    if (ROLE_DEFAULTS[role]) {
      return <Navigate to={ROLE_DEFAULTS[role]} replace />;
    }
  }
  
  return <Navigate to="/users" replace />;
};
```

### Navigation Persistence

```typescript
// Store last active path
useEffect(() => {
  localStorage.setItem('lastActivePath', location.pathname);
}, [location.pathname]);

// Restore on mount
useEffect(() => {
  const storedPath = localStorage.getItem('lastActivePath');
  if (storedPath) {
    navigate(storedPath, { replace: true });
  }
}, []);
```

---

## 🎨 Styling & Theming

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... more colors
      }
    }
  }
}
```

### CSS Variables

```css
/* index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Mantine Theme

```typescript
// main.tsx
const theme = createTheme({
  primaryColor: 'gray',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
  colors: {
    gray: ['#f8f9fa', '#e9ecef', ...],
  },
  components: {
    Paper: {
      defaultProps: {
        shadow: 'none',
        radius: '12',
        style: { border: '1px solid #e5e7eb' }
      }
    },
    Button: {
      defaultProps: { radius: '8' }
    }
  }
});
```

### Theme Configuration

```typescript
// theme.config.tsx
const themeConfig = {
  locale: 'en',
  theme: 'light',         // light, dark, system
  menu: 'vertical',       // vertical, collapsible-vertical, horizontal
  layout: 'full',         // full, boxed-layout
  rtlClass: 'ltr',        // rtl, ltr
  navbar: 'navbar-sticky', // navbar-sticky, navbar-floating, navbar-static
  semidark: false
};
```

### Custom Utility Classes

```css
/* Multi-line ellipsis */
.ellipsis-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 💻 Development Guidelines

### Code Style

#### TypeScript

```typescript
// Use explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

// Prefer const over let
const handleSubmit = async (data: FormData) => {
  // implementation
};

// Use optional chaining
const userName = user?.profile?.name;

// Use nullish coalescing
const defaultValue = value ?? 'default';
```

#### Component Structure

```typescript
// Import order
import { useState, useEffect } from 'react';              // React
import { useNavigate } from 'react-router-dom';           // Third-party
import { Button } from '@/components/ui/button';          // Internal
import { useAuth } from '@/hooks/useAuth';                // Hooks
import { apiRequest } from '@/apis/apiRequest';           // APIs
import './styles.css';                                    // Styles

// Component
export const MyComponent = () => {
  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [data, setData] = useState([]);
  
  // Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // Handlers
  const handleClick = () => {
    // handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => {};

// Files: PascalCase for components, camelCase for utilities
UserProfile.tsx
apiService.ts

// Functions: camelCase
const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Types/Interfaces: PascalCase
interface UserData {}
type ApiResponse = {};
```

### Best Practices

#### 1. State Management
```typescript
// Use Redux for global state
const user = useSelector((state) => state.auth.user);

// Use useState for local state
const [isOpen, setIsOpen] = useState(false);

// Use useReducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

#### 2. API Calls
```typescript
// Always handle loading and errors
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiRequest({ url: '/endpoint' });
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### 3. Form Handling
```typescript
// Use React Hook Form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
```

#### 4. Performance
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // handler
}, [dependency]);

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Error Handling

```typescript
// Use try-catch for async operations
try {
  const data = await apiRequest({ url: '/endpoint' });
  showMessage('Success!', 'success');
} catch (error) {
  showMessage(error.message, 'error');
}

// Use error boundaries for component errors
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Testing Guidelines

```typescript
// Component tests
describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });
});

// API tests
describe('authenticateUserApi', () => {
  it('should send OTP successfully', async () => {
    const data = { phoneNumber: '9876543210' };
    const response = await authenticateUserApi(data);
    expect(response.success).toBe(true);
  });
});
```

---

## 📦 Build & Deployment

### Build Process

```bash
# Production build
npm run build

# Output: dist/
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev
# Uses .env.development

# Staging build
npm run build:staging
# Uses .env.staging

# Production build
npm run build
# Uses .env.production
```

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api

# .env.staging
VITE_API_URL=https://staging-api.example.com/api

# .env.production
VITE_API_URL=https://api.example.com/api
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env': env,
    },
  };
});
```

### Build Optimization

```typescript
// Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Tree shaking (automatic with Vite)
import { Button } from '@/components/ui/button'; // Only Button is bundled

// Asset optimization
// Images, fonts automatically optimized by Vite
```

### Deployment

#### Static Hosting (Vercel, Netlify)

```bash
# Build
npm run build

# Deploy dist/ folder
# Configure redirect rules for SPA:
# /* -> /index.html
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

---

## ⚙️ Environment Configuration

### Environment Variables

```bash
# .env
VITE_API_URL=https://api.example.com

# Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

### TypeScript Environment Types

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add more env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Configuration Files

#### TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "skipLibCheck": true,
    "strictNullChecks": false
  }
}
```

#### PostCSS Config

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Issues

**Problem**: User logged out unexpectedly
```typescript
// Solution: Check token expiry
const token = localStorage.getItem('auth_token');
if (!token) {
  // Token missing, redirect to login
  navigate('/login');
}
```

#### 2. API Errors

**Problem**: 401/403 errors
```typescript
// Solution: Check if token is valid
// Token automatically removed on 401/403 by interceptor
// User redirected to login
```

**Problem**: Network timeout
```typescript
// Solution: Increase timeout in apiService.ts
const apiClient = axios.create({
  timeout: 180000, // 3 minutes
});
```

#### 3. Build Errors

**Problem**: Module not found
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

**Problem**: TypeScript errors
```bash
# Solution: Update TypeScript
npm install -D typescript@latest
```

#### 4. Styling Issues

**Problem**: Tailwind classes not working
```bash
# Solution: Rebuild Tailwind
npm run build
# Check tailwind.config.ts content paths
```

**Problem**: Mantine styles conflict
```typescript
// Solution: Ensure correct import order
import '@mantine/core/styles.css';
import './index.css'; // Your styles after Mantine
```

#### 5. Routing Issues

**Problem**: 404 on refresh
```nginx
# Solution: Configure server for SPA
location / {
  try_files $uri $uri/ /index.html;
}
```

**Problem**: Navigation not working
```typescript
// Solution: Ensure BrowserRouter wraps app
<BrowserRouter>
  <App />
</BrowserRouter>
```

### Debug Mode

```typescript
// Enable Redux DevTools
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// Console logging
console.log('User:', user);
console.log('State:', store.getState());
```

### Performance Issues

```typescript
// Use React DevTools Profiler
// Check for unnecessary re-renders

// Memoize components
const MemoizedComponent = memo(Component);

// Lazy load routes
const LazyPage = lazy(() => import('./pages/LazyPage'));
```

---

## 📚 Additional Resources

### Documentation Links

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Mantine UI](https://mantine.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)

### Internal Documentation

- Project architecture diagrams: `/docs/architecture`
- API documentation: `/docs/api`
- Component storybook: `/docs/components`

---

## 👥 Team & Support

### Development Team

- **Frontend Lead**: [Name]
- **Backend Lead**: [Name]
- **UI/UX Designer**: [Name]
- **QA Engineer**: [Name]

### Git Workflow

#### Branch Protection

Protected branches:
- `main` - Production
- `production` - Production releases
- `staging` - Staging environment
- `development` - Development work

Rules:
- ✅ Pull Request required
- ❌ No direct push
- ❌ No force push
- ❌ No branch deletion

#### Commit Convention

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code restructuring
test:     Tests
chore:    Maintenance

# Examples
feat(auth): add OTP verification
fix(territory): resolve map loading issue
docs(readme): update installation guide
```

#### Pull Request Template

```markdown
## Description
[Describe changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Screenshots
[If applicable]
```

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

**Copyright © 2024 R-OS. All rights reserved.**

---

## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Core modules implemented
- Authentication system
- Role-based access control
- Territory management
- Employee management
- Campaign system
- Feedback system

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Mobile app integration
- [ ] Enhanced reporting
- [ ] AI-powered insights
- [ ] Multi-language support
- [ ] Dark mode toggle

---

## 🎯 Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server

# Build
npm run build              # Production build
npm run build:staging      # Staging build

# Code Quality
npm run lint               # Run linter

# Preview
npm run preview            # Preview build
```

### Important Paths

```
/login                     # Login page
/otp                       # OTP verification
/users                     # People management
/territory/project         # Projects
/territory/land/dashboard  # Land management
/employee/dashboard        # Employee dashboard
/campaign-list             # Campaigns
```

### Key Files

```
src/main.tsx              # Entry point
src/App.tsx               # Root component
src/routing/AppRoutes.tsx # Route configuration
src/store/store.ts        # Redux store
src/apis/apiService.ts    # API client
```

---

**For questions or support, contact the development team.**

**Happy Coding! 🚀**

