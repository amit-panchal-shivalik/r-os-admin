import * as Yup from 'yup';

// Floors validation schema
export const floorsSchema = Yup.object().shape({
  floorNumber: Yup.number()
    .required('Floor Number is required')
    .integer('Floor Number must be a whole number')
    .min(0, 'Floor Number cannot be negative')
    .typeError('Floor Number must be a number'),
  floorName: Yup.string()
    .required('Floor Name is required')
    .trim()
    .test('no-whitespace', 'Floor Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  description: Yup.string()
    .trim()
    .notRequired(),
  totalUnits: Yup.number()
    .required('Total Units is required')
    .integer('Total Units must be a whole number')
    .min(0, 'Total Units cannot be negative')
    .typeError('Total Units must be a number'),
  blockId: Yup.string()
    .required('Block is required')
    .trim(),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive', 'Under Construction'], 'Please select a valid status'),
});

