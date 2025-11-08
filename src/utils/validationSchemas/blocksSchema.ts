import * as Yup from 'yup';

// Blocks validation schema
export const blocksSchema = Yup.object().shape({
  blockName: Yup.string()
    .required('Block Name is required')
    .trim()
    .test('no-whitespace', 'Block Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive', 'Under Construction'], 'Please select a valid status'),
  description: Yup.string()
    .trim()
    .notRequired(),
});

