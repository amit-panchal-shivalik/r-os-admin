export interface Unit {
    _id: string;
    unitNumber: string;
    unitType: string;
    area: string;
    floorId: string;
    blockId: string;
    unitStatus: 'Vacant' | 'Occupied' | 'Under Maintenance';
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitPayload {
    blockId: string;
    floorId: string;
    unitNumber: string;
    unitType: string;
    area: string;
    unitStatus?: 'Vacant' | 'Occupied' | 'Under Maintenance';
}

export interface UpdateUnitStatusPayload {
    unitStatus: 'Vacant' | 'Occupied' | 'Under Maintenance';
}