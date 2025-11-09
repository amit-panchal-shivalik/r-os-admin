import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [mobileSent, setMobileSent] = useState('');
  const [otpId, setOtpId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  // Handle mobile number input (max 10 digits)
  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobile', value);
  };

  // Handle OTP input with auto-focus
  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    // Auto-focus next input when a digit is entered
    if (value && idx < 5) {
      setTimeout(() => {
        otpRefs.current[idx + 1]?.focus();
      }, 10);
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      const otpValue = newOtp.join('');
      if (otpValue.length === 6) {
        onVerifyOtp();
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus the last input after paste
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 10);
      
      // Auto-submit after paste if all digits are present
      setTimeout(() => {
        onVerifyOtp();
      }, 100);
    }
  };

  // Handle backspace and arrow key navigation
  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!otp[idx] && idx > 0) {
        // Move to previous input if current is empty
        const newOtp = [...otp];
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        otpRefs.current[idx - 1]?.focus();
      } else if (otp[idx]) {
        // Clear current input but stay focused
        const newOtp = [...otp];
        newOtp[idx] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      otpRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      e.preventDefault();
      otpRefs.current[idx + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Submit when Enter is pressed and OTP is complete
      if (otp.join('').length === 6) {
        onVerifyOtp();
      }
    }
  };

  // Reset OTP when dialog opens
  useEffect(() => {
    if (otpDialogOpen) {
      setOtp(['', '', '', '', '', '']);
      // Focus first input after a short delay
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpDialogOpen]);

  // Send OTP API
  const onSendOtp = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        phone_number: data.mobile
      };
      const response = await api.post('/auth/login', payload);
      
      if (response.data.message === 'otp_send_success') {
        setOtpId(response.data.data.otp_id);
        setMobileSent(data.mobile);
        setOtpDialogOpen(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error: any) {
      if (error.response?.data?.message === 'user not found') {
        toast.error('User not found. Please register first.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP API
  const onVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6 || !otpId) return;
    
    setIsLoading(true);
    try {
      const payload = {
        otp: otpValue
      };
      const response = await api.post(`/auth/verifyOtp/${otpId}`, payload);
      const { token, user_id, user_name } = response.data.data;
      login({ id: user_id, name: user_name, email: '', role: '', image: undefined }, token);
      setOtpDialogOpen(false);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      // Clear OTP on error for better UX
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your mobile number to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSendOtp)}>
          <CardContent className="space-y-4">
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
                  {...register('mobile', { onChange: handleMobileInput })}
                  className="rounded-l-none"
                  autoComplete="tel"
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'SEND OTP'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the 6-digit OTP sent to +91{mobileSent}
            </p>
          </DialogHeader>
          <div className="flex justify-center gap-2 mt-4" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                ref={(el) => (otpRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-md "
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                autoFocus={idx === 0 && otpDialogOpen}
                disabled={isLoading}
              />
            ))}
          </div>
          <Button 
            className="w-full mt-4" 
            disabled={otp.join('').length !== 6 || isLoading} 
            onClick={onVerifyOtp}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}