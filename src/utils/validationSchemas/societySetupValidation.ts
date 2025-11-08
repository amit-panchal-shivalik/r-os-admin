import * as Yup from 'yup';

export const societySetupValidationSchema = Yup.object().shape({
  // Basic Information
  societyName: Yup.string()
    .required('Society/Project name is required')
    .min(3, 'Name must be at least 3 characters'),
  
  societyCode: Yup.string()
    .required('Society code is required'),
  
  description: Yup.string()
    .required('Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  
  logo: Yup.mixed()
    .required('Logo is required')
    .test('fileSize', 'File is required', (value) => value !== null),

  // Project Details
  projectType: Yup.string()
    .required('Project type is required')
    .oneOf(['Residential', 'Commercial', 'Mixed Use'], 'Invalid project type'),
  
  totalUnits: Yup.number()
    .required('Units per floor is required')
    .min(1, 'Must have at least 1 unit')
    .typeError('Must be a number'),
  
  totalBlocks: Yup.number()
    .required('Total blocks is required')
    .min(0, 'Cannot be negative')
    .typeError('Must be a number'),
  
  totalFloors: Yup.number()
    .required('Total floors is required')
    .min(0, 'Cannot be negative')
    .typeError('Must be a number'),
  
  carpetAreaRange: Yup.string()
    .required('Carpet area range is required'),
  
  projectStartDate: Yup.date()
    .required('Project start date is required')
    .typeError('Invalid date'),
  
  completionDate: Yup.date()
    .required('Completion date is required')
    .min(Yup.ref('projectStartDate'), 'Completion date must be after start date')
    .typeError('Invalid date'),
  
  developerName: Yup.string()
    .required('Developer/Builder name is required'),

  // Contact Information
  contactPersonName: Yup.string()
    .required('Contact person name is required')
    .min(2, 'Name must be at least 2 characters'),
  
  contactNumber: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Must be a valid email'),
  
  alternateContact: Yup.string()
    .required('Alternate contact is required')
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
  
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
  
  city: Yup.string()
    .required('City is required'),
  
  state: Yup.string()
    .required('State is required'),
  
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Must be a valid 6-digit pincode'),

  // Legal Documents
  reraNumber: Yup.string()
    .required('RERA number is required'),
  reraCertificate: Yup.mixed()
    .required('RERA certificate is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  reraExpiryDate: Yup.date()
    .required('RERA expiry date is required')
    .typeError('Invalid date'),
  
  fireNocNumber: Yup.string()
    .required('Fire NOC number is required'),
  fireNocDocument: Yup.mixed()
    .required('Fire NOC document is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  fireNocValidityDate: Yup.date()
    .required('Fire NOC validity date is required')
    .typeError('Invalid date'),
  
  buCertificateNumber: Yup.string()
    .required('BU certificate number is required'),
  buCertificate: Yup.mixed()
    .required('BU certificate is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  buIssueDate: Yup.date()
    .required('BU issue date is required')
    .typeError('Invalid date'),
  
  liftLicenceNumber: Yup.string()
    .required('Lift licence number is required'),
  liftLicenceDocument: Yup.mixed()
    .required('Lift licence document is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  liftLicenceExpiryDate: Yup.date()
    .required('Lift licence expiry date is required')
    .typeError('Invalid date'),

  // Financial Setup - Bank Details
  bankName: Yup.string()
    .required('Bank name is required'),
  
  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(/^[0-9]{9,18}$/, 'Must be a valid account number'),
  
  accountHolderName: Yup.string()
    .required('Account holder name is required'),
  
  ifscCode: Yup.string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Must be a valid IFSC code'),
  
  branchName: Yup.string()
    .required('Branch name is required'),
  branchAddress: Yup.string()
    .required('Branch address is required'),

  // Financial Setup - Tax Information
  gstNumber: Yup.string()
    .required('GST number is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Must be a valid GST number'),
  
  gstCertificate: Yup.mixed()
    .required('GST certificate is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  
  panNumber: Yup.string()
    .required('PAN number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Must be a valid PAN number'),
  
  tanNumber: Yup.string()
    .required('TAN number is required')
    .matches(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Must be a valid TAN number'),

  // Financial Year
  fyStartMonth: Yup.string()
    .required('Financial year start month is required'),
  
  currentFinancialYear: Yup.string()
    .required('Current financial year is required'),

  // Additional Settings
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Pending', 'Active', 'Inactive'], 'Invalid status'),
  
  maintenanceBillingCycle: Yup.string()
    .required('Maintenance billing cycle is required')
    .oneOf(['Monthly', 'Quarterly', 'Yearly'], 'Invalid billing cycle'),
  
  registeredMembersCount: Yup.number()
    .required('Registered members count is required')
    .min(0, 'Cannot be negative')
    .typeError('Must be a number'),
});

