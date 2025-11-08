import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    floors: [],
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const floorSlice = createSlice({
    name: 'floor',
    initialState,
    reducers: {
        // Create Floors
        createFloors(state, action) {
            state.status = 'pending';
        },
        createFloorsSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        createFloorsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get Floors
        getFloors(state, action) {
            state.status = 'pending';
        },
        getFloorsSuccess(state, action) {
            state.floors = action.payload.floors;
            state.pagination = action.payload.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getFloorsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reset
        resetFloor(state) {
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    createFloors,
    createFloorsSuccess,
    createFloorsFailure,
    getFloors,
    getFloorsSuccess,
    getFloorsFailure,
    resetFloor
} = floorSlice.actions;

export default floorSlice.reducer;