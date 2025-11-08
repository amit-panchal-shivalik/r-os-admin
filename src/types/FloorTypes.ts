export interface Floor {
    _id: string;
    floorName: string;
    blockId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFloorsPayload {
    blockId: string;
    floorNamePrefix: string;
    startFloorNumber: number;
    endFloorNumber: number;
}