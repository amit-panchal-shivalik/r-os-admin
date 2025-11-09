import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bills: [],
    bill: null,
    types: [],
    type: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const maintenanceSlice = createSlice({
    name: 'maintenance',
    initialState,
    reducers: {
        // Bills
        createMaintenanceBill(state, action) {
            state.status = 'pending';
        },
        createMaintenanceBillSuccess(state, action) {
            state.bill = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createMaintenanceBillFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getMaintenanceBills(state, action) {
            state.status = 'pending';
        },
        getMaintenanceBillsSuccess(state, action) {
            state.bills = action.payload.bills || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getMaintenanceBillsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateMaintenanceBill(state, action) {
            state.status = 'pending';
        },
        updateMaintenanceBillSuccess(state, action) {
            state.bill = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateMaintenanceBillFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        publishMaintenanceBill(state, action) {
            state.status = 'pending';
        },
        publishMaintenanceBillSuccess(state, action) {
            state.bill = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        publishMaintenanceBillFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteMaintenanceBill(state, action) {
            state.status = 'pending';
        },
        deleteMaintenanceBillSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteMaintenanceBillFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Types
        getMaintenanceTypes(state, action) {
            state.status = 'pending';
        },
        getMaintenanceTypesSuccess(state, action) {
            state.types = action.payload.types || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getMaintenanceTypesFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        createMaintenanceType(state, action) {
            state.status = 'pending';
        },
        createMaintenanceTypeSuccess(state, action) {
            state.type = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createMaintenanceTypeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetMaintenance(state) {
            state.status = 'idle';
            state.error = null;
            state.bill = null;
            state.type = null;
        },
    },
});

export const {
    createMaintenanceBill,
    createMaintenanceBillSuccess,
    createMaintenanceBillFailure,
    getMaintenanceBills,
    getMaintenanceBillsSuccess,
    getMaintenanceBillsFailure,
    updateMaintenanceBill,
    updateMaintenanceBillSuccess,
    updateMaintenanceBillFailure,
    publishMaintenanceBill,
    publishMaintenanceBillSuccess,
    publishMaintenanceBillFailure,
    deleteMaintenanceBill,
    deleteMaintenanceBillSuccess,
    deleteMaintenanceBillFailure,
    getMaintenanceTypes,
    getMaintenanceTypesSuccess,
    getMaintenanceTypesFailure,
    createMaintenanceType,
    createMaintenanceTypeSuccess,
    createMaintenanceTypeFailure,
    resetMaintenance
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
