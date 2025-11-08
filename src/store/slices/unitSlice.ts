import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    units: [],
    unit: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const unitSlice = createSlice({
    name: 'unit',
    initialState,
    reducers: {
        // Create Unit
        createUnit(state, action) {
            state.status = 'pending';
        },
        createUnitSuccess(state, action) {
            state.unit = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createUnitFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get Units
        getUnits(state, action) {
            state.status = 'pending';
        },
        getUnitsSuccess(state, action) {
            state.units = action.payload.units;
            state.pagination = action.payload.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getUnitsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Update Unit Status
        updateUnitStatus(state, action) {
            state.status = 'pending';
        },
        updateUnitStatusSuccess(state, action) {
            state.unit = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateUnitStatusFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reset
        resetUnit(state) {
            state.status = 'idle';
            state.error = null;
            state.unit = null;
        },
    },
});

export const {
    createUnit,
    createUnitSuccess,
    createUnitFailure,
    getUnits,
    getUnitsSuccess,
    getUnitsFailure,
    updateUnitStatus,
    updateUnitStatusSuccess,
    updateUnitStatusFailure,
    resetUnit
} = unitSlice.actions;

export default unitSlice.reducer;