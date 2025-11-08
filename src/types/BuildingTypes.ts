export interface Building {
    _id: string;
    societyName: string;
    buildingName: string;
    territory?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    totalBlocks: number;
    totalUnits: number;
    buildingType?: string;
    buildingLogo?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface BuildingAdmin {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    buildingId: string;
    status: string;
}

export interface CreateBuildingPayload {
    societyName: string;
    buildingName: string;
    territory?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    projectId?: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
}

export interface CreateBuildingResponse {
    building: {
        id: string;
        societyName: string;
        buildingName: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    buildingAdmin: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    loginLink: string;
}