import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { authenticateUserApi } from "@/apis/auth";
import { setToLocalStorage } from "@/utils/localstorage";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phoneNumber)) {
      toast({ title: "Invalid number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    try {
      await authenticateUserApi({ mobile_number: phoneNumber });
      setToLocalStorage("user_mobile", phoneNumber);
      toast({ title: "OTP sent", description: "Please check your phone for the OTP." });
      navigate("/otp", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to request OTP. Please try again.";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center p-4 bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: "url('/authBgImage.svg')" }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 text-center p-6">
        <div className="w-12 h-12 mx-auto rounded-[10px] bg-white border border-[#F0F0F0] flex items-center justify-center">
          <img
            src="/loginIcon.svg"
            alt="Login"
            className="w-5 h-5"
            loading="lazy"
          />
        </div>
        <h1 className="my-4 text-2xl font-bold text-[#2E2E2E]">R-OS</h1>
        <p className="inline-block px-[14px] py-[6px] h-[36px] rounded-full bg-[#EDEDED] text-[#757575] text-[14px] leading-[24px] font-semibold text-center">
          Admin Login
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
          <Button
            type="submit"
            disabled={submitting || !(phoneNumber?.trim()?.length === 10)}
            className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>

        <div className="mt-3 text-[#757575] hover:text-[#1a1a1a] font-bold">
          <a href="/register">Sign Up</a>
        </div>

        {/* Version Info */}
        <p className="mt-3 text-xs text-gray-400">R-OS Admin v1.0.0</p>
      </div>
    </div>
  );
};
