import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Update Building Data
    building: null,
    error: null,
    status: 'idle',
};

const buildingSlice = createSlice({
    name: 'building',
    initialState,
    reducers: {
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
    updateBuilding,
    updateBuildingSuccess,
    updateBuildingFailure,
    resetUpdateBuilding,
} = buildingSlice.actions;

export default buildingSlice.reducer;

