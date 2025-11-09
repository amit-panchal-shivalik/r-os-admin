export interface Block {
    _id: string;
    blockName: string;
    buildingId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBlockPayload {
    blockName: string;
    buildingId: string;
}

export interface UpdateBlockPayload {
    blockName?: string;
    status?: string;
}