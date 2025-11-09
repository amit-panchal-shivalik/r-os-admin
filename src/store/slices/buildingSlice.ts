import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Create Building
    building: null,
    buildings: [],
    error: null,
    status: 'idle', // idle, pending, complete, failed
    
    // Pagination
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
};

const buildingSlice = createSlice({
    name: 'building',
    initialState,
    reducers: {
        // Create Building Actions
        createBuilding(state, action) {
            state.status = 'pending';
        },
        createBuildingSuccess(state, action) {
            state.building = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createBuildingFailure(state, action) {
            state.building = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get All Buildings Actions
        getAllBuildings(state, action) {
            state.status = 'pending';
        },
        getAllBuildingsSuccess(state, action) {
            state.buildings = action.payload.buildings;
            state.pagination = action.payload.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getAllBuildingsFailure(state, action) {
            state.buildings = [];
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get Building By ID Actions
        getBuildingById(state, action) {
            state.status = 'pending';
        },
        getBuildingByIdSuccess(state, action) {
            state.building = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getBuildingByIdFailure(state, action) {
            state.building = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reset
        resetBuilding(state) {
            state.status = 'idle';
            state.error = null;
            state.building = null;
        },
    },
});

export const {
    createBuilding,
    createBuildingSuccess,
    createBuildingFailure,
    getAllBuildings,
    getAllBuildingsSuccess,
    getAllBuildingsFailure,
    getBuildingById,
    getBuildingByIdSuccess,
    getBuildingByIdFailure,
    resetBuilding
} = buildingSlice.actions;

export default buildingSlice.reducer;