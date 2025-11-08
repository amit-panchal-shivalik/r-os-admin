import * as Yup from 'yup';

// Building Details validation schema
export const buildingDetailsSchema = Yup.object().shape({
  buildingName: Yup.string()
    .required('Building Name is required')
    .trim()
    .test('no-whitespace', 'Building Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  societyName: Yup.string()
    .required('Society Name is required')
    .trim()
    .test('no-whitespace', 'Society Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  address: Yup.string()
    .required('Address is required')
    .trim()
    .test('no-whitespace', 'Address cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  city: Yup.string()
    .required('City is required')
    .trim()
    .test('no-whitespace', 'City cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  state: Yup.string()
    .required('State is required')
    .trim()
    .test('no-whitespace', 'State cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  totalBlocks: Yup.number()
    .required('Total Blocks is required')
    .integer('Total Blocks must be a whole number')
    .min(0, 'Total Blocks cannot be negative')
    .typeError('Total Blocks must be a number'),
  totalUnits: Yup.number()
    .required('Total Units is required')
    .integer('Total Units must be a whole number')
    .min(0, 'Total Units cannot be negative')
    .typeError('Total Units must be a number'),
  buildingType: Yup.string()
    .required('Building Type is required')
    .oneOf(['Residential', 'Commercial', 'Mixed', 'Industrial'], 'Please select a valid building type'),
});

