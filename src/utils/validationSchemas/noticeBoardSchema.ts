import * as Yup from 'yup';

export const noticeBoardSchema = Yup.object().shape({
  noticeNumber: Yup.string()
    .required('Notice Number is required')
    .trim()
    .test('no-whitespace', 'Notice Number cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  title: Yup.string()
    .required('Title is required')
    .trim()
    .test('no-whitespace', 'Title cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  category: Yup.string()
    .required('Category is required'),
  blockId: Yup.string()
    .required('Block is required'),
  unitId: Yup.string()
    .required('Unit is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['Low', 'Medium', 'High', 'Urgent'], 'Please select a valid priority'),
  publishDate: Yup.string()
    .required('Publish Date is required'),
  expiryDate: Yup.string()
    .required('Expiry Date is required')
    .test('is-after-publish', 'Expiry Date must be after Publish Date', function (value) {
      const { publishDate } = this.parent;
      if (!publishDate || !value) return true;
      return new Date(value) >= new Date(publishDate);
    }),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Draft', 'Published', 'Expired', 'Archived'], 'Please select a valid status'),
});

