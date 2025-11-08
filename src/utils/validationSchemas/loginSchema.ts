import * as Yup from 'yup';

// Login validation schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .trim()
    .test('no-whitespace', 'Email cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .trim(),
});

