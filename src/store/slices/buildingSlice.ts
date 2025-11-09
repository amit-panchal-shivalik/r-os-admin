import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Building Data
    building: null,
    error: null,
    status: 'idle',
    fetchStatus: 'idle',
    fetchError: null,
};

const buildingSlice = createSlice({
    name: 'building',
    initialState,
    reducers: {
        // Get Building Actions
        getBuilding(state, action) {
            state.fetchStatus = 'loading';
            state.fetchError = null;
        },
        getBuildingSuccess(state, action) {
            state.building = action.payload;
            state.fetchError = null;
            state.fetchStatus = 'complete';
        },
        getBuildingFailure(state, action) {
            state.building = null;
            state.fetchError = action.payload;
            state.fetchStatus = 'failed';
        },
        resetGetBuilding(state) {
            state.fetchStatus = 'idle';
            state.fetchError = null;
        },
        // Update Building Actions
        updateBuilding(state, action) {
            state.status = 'loading';
        },
        updateBuildingSuccess(state, action) {
            state.building = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateBuildingFailure(state, action) {
            state.building = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        resetUpdateBuilding(state) {
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    getBuilding,
    getBuildingSuccess,
    getBuildingFailure,
    resetGetBuilding,
    updateBuilding,
    updateBuildingSuccess,
    updateBuildingFailure,
    resetUpdateBuilding,
} = buildingSlice.actions;

export default buildingSlice.reducer;

