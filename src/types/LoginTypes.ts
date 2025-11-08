export interface LoginPayload {
    countryCode: string;
    phoneNumber: string;
}

export interface BuildingAdminLoginPayload {
    countryCode: string;
    phoneNumber: string;
    buildingId: string;
}

export interface VerifyOTPPayload {
    countryCode: string;
    phoneNumber: string;
    otp: string;
}

export interface BuildingAdminVerifyOTPPayload {
    countryCode: string;
    phoneNumber: string;
    otp: string;
    buildingId: string;
}