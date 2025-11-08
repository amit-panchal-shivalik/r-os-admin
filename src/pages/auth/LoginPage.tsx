import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { superAdminLogin, buildingAdminLogin, resetAuth } from '@/store/slices/authSlice';
import { setToLocalStorage } from '@/utils/localstorage';
import { showMessage } from '@/utils/Constant';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buildingId } = useParams(); // Check if building ID is in URL

    const { status, error, userType }: any = useSelector((state: any) => state.auth);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const isBuildingAdmin = !!buildingId;

    useEffect(() => {
        if (status === 'complete') {
            showMessage('OTP sent successfully');
            setSubmitting(false);
            
            // Store phone number and building ID if applicable
            setToLocalStorage('user_mobile', phoneNumber);
            if (isBuildingAdmin) {
                setToLocalStorage('building_id', buildingId);
            }
            
            navigate(isBuildingAdmin ? `/${buildingId}/otp` : '/otp');
            dispatch(resetAuth());
        } else if (status === 'failed') {
            showMessage(error, 'error');
            setSubmitting(false);
        }
    }, [status, navigate, dispatch, phoneNumber, isBuildingAdmin, buildingId]);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPhoneNumber(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        if (!phoneNumber) {
            showMessage('Please enter your mobile number.', 'error');
            setSubmitting(false);
            return;
        }

        const phoneNumberPattern = /^[0-9]{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            showMessage('Please enter a valid 10-digit mobile number.', 'error');
            setSubmitting(false);
            return;
        }

        if (isBuildingAdmin) {
            // Building Admin Login
            dispatch(buildingAdminLogin({
                countryCode: '+91',
                phoneNumber,
                buildingId: buildingId!
            }));
        } else {
            // Super Admin Login
            dispatch(superAdminLogin({
                countryCode: '+91',
                phoneNumber
            }));
        }
    };

    return (
        <div
            className="min-h-screen w-full bg-white flex items-center justify-center p-4 bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: "url('/authBgImage.svg')" }}
        >
            <div className="w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-[10px] bg-white border border-[#F0F0F0] flex items-center justify-center">
                    <img src="/loginIcon.svg" alt="Login" className="w-5 h-5" loading="lazy" />
                </div>
                <h1 className="my-4 text-2xl font-bold text-[#2E2E2E]">R-OS</h1>
                <p className="inline-block px-[14px] py-[6px] h-[36px] rounded-full bg-[#EDEDED] text-[#757575] text-[14px] leading-[24px] font-semibold text-center">
                    {isBuildingAdmin ? 'Building Admin Login' : 'Super Admin Login'}
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#EDEDED] text-gray-500 text-sm rounded-[4px] px-[6px] py-[8px] leading-none h-[25px] flex items-center justify-center">
                            +91
                        </span>
                        <input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="Enter Mobile Number"
                            maxLength={10}
                            className="ml-2 w-full pl-12 pr-4 py-2 bg-transparent h-12 border-0 border-b border-[#E0E0E0] focus:border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 text-sm"
                            required
                        />
                    </div>
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {error}
                            </p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={status === 'pending' || !(phoneNumber?.trim()?.length === 10)}
                        className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        {status === 'pending' || submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Sending OTP...
                            </>
                        ) : (
                            'Send OTP'
                        )}
                    </Button>
                </form>
                <p className="mt-6 text-xs text-gray-400">R-OS Admin v1.0.0</p>
            </div>
        </div>
    );
};