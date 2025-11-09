import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api, { fetchJobTitles, fetchLocalities, fetchCategories } from '@/lib/api';
import { toast } from 'sonner';
// ThemeToggle intentionally removed; keep layout clean black/white palette
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import ReactSelect from 'react-select';
import { useTheme } from '@/components/theme-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [otpId, setOtpId] = useState<number | null>(null);
  const [mobileSent, setMobileSent] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      jobTitle: undefined,
      companyName: '',
      interestedLocality: [],
      interestedCategory: [],
    },
  });

  // Debug: Log errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form errors:', errors);
      console.log('Current form values:', getValues());
    }
  }, [errors, getValues]);

  const nameValue = watch('name');
  const emailValue = watch('email');
  const mobileValue = watch('mobile');
  const jobTitleValue = watch('jobTitle');
  const companyNameValue = watch('companyName');
  
  const [jobTitleOptions, setJobTitleOptions] = useState<{ value: string; label: string }[]>([]);
  const [localityOptions, setLocalityOptions] = useState<{ value: string; label: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchJobTitles().then(setJobTitleOptions).catch(() => setJobTitleOptions([]));
    fetchLocalities().then(setLocalityOptions).catch(() => setLocalityOptions([]));
    fetchCategories().then(setCategoryOptions).catch(() => setCategoryOptions([]));
  }, []);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#ffffff',
      borderColor: '#e6e7ea',
      color: '#0b0b0b',
      '&:hover': { borderColor: '#d1d5db' },
    }),
    menu: (provided: any) => ({ ...provided, backgroundColor: '#ffffff', borderColor: '#e6e7ea' }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e5e7eb' : state.isFocused ? '#f3f4f6' : '#ffffff',
      color: '#0b0b0b',
      '&:hover': { backgroundColor: '#f3f4f6' },
    }),
    multiValue: (provided: any) => ({ ...provided, backgroundColor: '#e5e7eb', color: '#0b0b0b' }),
    multiValueLabel: (provided: any) => ({ ...provided, color: '#0b0b0b' }),
    multiValueRemove: (provided: any) => ({ ...provided, color: '#0b0b0b', '&:hover': { backgroundColor: '#d1d5db' } }),
    input: (provided: any) => ({ ...provided, color: '#0b0b0b' }),
    placeholder: (provided: any) => ({ ...provided, color: '#6b7280' }),
  };

  // Handle OTP input
  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
  };

  // Handle OTP key events for auto-focus
  const handleOtpKeyUp = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (e.key >= '0' && e.key <= '9' && value && idx < 5) {
      // Auto-focus next field when a digit is entered
      setTimeout(() => {
        otpRefs[idx + 1].current?.focus();
      }, 10);
    } else if (e.key === 'Backspace') {
      if (!value && idx > 0) {
        // Move to previous field if current is empty
        setTimeout(() => {
          otpRefs[idx - 1].current?.focus();
        }, 10);
      }
    }
  };

  // OTP verify API
  const onVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6 || !otpId) return;
    setIsLoading(true);
    try {
      const payload = { otp: otpValue };
      const response = await api.post(`/auth/verifyOtp/${otpId}`, payload);
      const { token, user_id, user_name } = response.data.data;
      login({ id: user_id, name: user_name, email: '', role: '', image: undefined }, token);
      setOtpDialogOpen(false);
      toast.success('Registration & verification successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmitForm = async (data: RegisterFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);

    try {
      // Transform data to match API payload structure
      const payload = {
        email: data.email,
        name: data.name,
        company_name: data.companyName || '',
        mobile_number: data.mobile,
        job_title_id: data.jobTitle || '',
        interested_localities: data.interestedLocality?.map(id => parseInt(id)) || [],
        interested_categories: data.interestedCategory?.map(id => parseInt(id)) || [],
      };

      console.log('Sending payload:', payload);
      const response = await api.post('/auth/signup', payload);
      if (response.data.message === 'otp_send_success') {
        setOtpId(response.data.data.otp_id);
        setMobileSent(data.mobile);
        setOtpDialogOpen(true);
        toast.success('OTP sent! Please verify.');
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Controlled handlers for inputs
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value, { shouldValidate: isSubmitted, shouldDirty: true });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('email', e.target.value, { shouldValidate: isSubmitted, shouldDirty: true });
  };

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobile', value, { shouldValidate: isSubmitted, shouldDirty: true });
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('companyName', e.target.value, { shouldValidate: isSubmitted, shouldDirty: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={nameValue || ''}
                  onChange={handleNameChange}
                  className="border border-gray-300"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailValue || ''}
                  onChange={handleEmailChange}
                  className="border border-gray-300"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +91
                  </span>
                  <Input
                    id="mobile"
                    type="text"
                    placeholder="XXXXXXXXXX"
                    maxLength={10}
                    value={mobileValue || ''}
                    onChange={handleMobileInput}
                    className="rounded-l-none border border-gray-300"
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Select  value={jobTitleValue || ''} onValueChange={(value) => setValue('jobTitle', value, { shouldValidate: isSubmitted, shouldDirty: true })}>
                  <SelectTrigger className='w-full border border-gray-300'>
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your Company"
                value={companyNameValue || ''}
                onChange={handleCompanyNameChange}
                className="border border-gray-300"
              />
              {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="interestedLocality">Interested Locality</Label>
              <ReactSelect
                isMulti
                instanceId="interestedLocality"
                styles={customStyles}
                options={localityOptions}
                onChange={(selected) => setValue('interestedLocality', selected ? selected.map(s => s.value) : [], { shouldValidate: isSubmitted, shouldDirty: true })}
                placeholder="Select localities"
              />
              {errors.interestedLocality && <p className="text-red-500 text-sm">{errors.interestedLocality.message}</p>}
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="interestedCategory">Interested Category</Label>
              <ReactSelect
                isMulti
                instanceId="interestedCategory"
                styles={customStyles}
                options={categoryOptions}
                onChange={(selected) => setValue('interestedCategory', selected ? selected.map(s => s.value) : [], { shouldValidate: isSubmitted, shouldDirty: true })}
                placeholder="Select categories"
              />
              {errors.interestedCategory && <p className="text-red-500 text-sm">{errors.interestedCategory.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-2 mt-4">
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-md "
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyUp={e => handleOtpKeyUp(idx, e)}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <Button className="w-full mt-4" disabled={otp.join('').length !== 6 || isLoading} onClick={onVerifyOtp}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

