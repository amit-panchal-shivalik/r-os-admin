import { LoginPayload } from "@/types/LoginTypes";
import { apiRequest } from "./apiRequest";
import { RegisterPayload } from "@/types/RegisterTypes";
import { VerifyOtpRequest, OtpVerifyResponse } from "@/types/OTPTypes";

// API function to create user
export const createUserApi = async (
  data: RegisterPayload
): Promise<RegisterPayload> => {
  return await apiRequest<RegisterPayload>({
    method: "POST",
    url: "/api/v1/auth/register",
    data: data,
  });
};

// API function to authenticate user
export const authenticateUserApi = async (
  data: LoginPayload
): Promise<LoginPayload> => {
  return await apiRequest<LoginPayload>({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    data: data,
  });
};

// API function to verify OTP
export const verifyOTPApi = async (
  data: VerifyOtpRequest
): Promise<OtpVerifyResponse> => {
  return await apiRequest<OtpVerifyResponse>({
    method: "POST",
    url: "/api/v1/auth/verify-otp",
    data: data,
  });
};
