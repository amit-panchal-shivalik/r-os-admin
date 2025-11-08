import * as Yup from 'yup';

// Units validation schema
export const unitsSchema = Yup.object().shape({
  unitNumber: Yup.string()
    .required('Unit Number is required')
    .trim()
    .test('no-whitespace', 'Unit Number cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  blockId: Yup.string()
    .required('Block is required')
    .trim(),
  floorId: Yup.string()
    .required('Floor is required')
    .trim(),
  type: Yup.string()
    .required('Unit Type is required')
    .oneOf(['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Penthouse', 'Shop', 'Office'], 'Please select a valid unit type'),
  area: Yup.number()
    .required('Area is required')
    .min(0, 'Area cannot be negative')
    .typeError('Area must be a number'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive', 'Under Construction', 'Sold', 'Rented'], 'Please select a valid status'),
});

