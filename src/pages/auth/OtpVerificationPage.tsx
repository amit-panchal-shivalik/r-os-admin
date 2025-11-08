import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Shield, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { verifyOtp, resendOtp } from "../../apis/adminAuthApi";
import { OtpInput } from "../../components/auth/OtpInput";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { login, isAuthenticated } = useAuth();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string>("/");

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Redirect when authentication is successful
  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      console.log("✅ Authentication confirmed, redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [shouldRedirect, isAuthenticated, redirectPath, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await verifyOtp(email, otp);
      console.log("✅ OTP Verified! Response:", response);

      // Update auth context with admin data
      console.log("🔄 Calling login() with admin data...");
      login(response.result.admin);

      toast.success(response.message || "Login successful!");

      // Determine redirect based on role
      const roleKey = response.result.admin.roleKey;
      debugger;
      const targetPath = roleKey === "super_admin" ? "/users" : "/societies";

      console.log(`🚀 Will navigate to: ${targetPath} once auth is confirmed`);

      // Set redirect path and flag - useEffect will handle navigation
      setRedirectPath(targetPath);
      setShouldRedirect(true);
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      const errorMessage =
        error.message || "Invalid or expired OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Clear OTP on error
      setOtp("");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const response = await resendOtp(email);
      toast.success(response.message || "New OTP sent to your email");

      // Reset timer
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.message || "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !isLoading) {
      handleVerify();
    }
  }, [otp]);

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={handleBackToLogin}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to login</span>
          </button>

          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-gray-600">We've sent a 6-digit code to</p>
            <p className="text-sm font-semibold text-blue-600 mt-1">{email}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3 text-center">
              Enter Verification Code
            </label>
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              error={!!error}
            />
            {error && (
              <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isLoading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify & Login"
            )}
          </Button>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in {resendTimer}s
              </p>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-xs text-gray-700 text-center">
              ⏱️ OTP expires in 10 minutes
              <br />
              <span className="text-gray-500">
                Check your spam folder if you don't see it
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
