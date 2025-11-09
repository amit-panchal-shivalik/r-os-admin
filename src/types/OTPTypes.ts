export interface VerifyOtpRequest {
  mobile_number: string;
  otp: string;
}

export interface OtpVerifyResponse {
  access_token: string;
  refresh_token: string;
  user: {
    user_id: string;
    mobile_number: string;
    full_name: string;
    roles: string[];
  };
}
