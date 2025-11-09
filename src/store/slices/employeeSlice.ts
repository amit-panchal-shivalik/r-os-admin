import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    employees: [],
    employee: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        createEmployee(state, action) {
            state.status = 'pending';
        },
        createEmployeeSuccess(state, action) {
            state.employee = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createEmployeeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getEmployees(state, action) {
            state.status = 'pending';
        },
        getEmployeesSuccess(state, action) {
            state.employees = action.payload.employees || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getEmployeesFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateEmployee(state, action) {
            state.status = 'pending';
        },
        updateEmployeeSuccess(state, action) {
            state.employee = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateEmployeeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteEmployee(state, action) {
            state.status = 'pending';
        },
        deleteEmployeeSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteEmployeeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetEmployee(state) {
            state.status = 'idle';
            state.error = null;
            state.employee = null;
        },
    },
});

export const {
    createEmployee,
    createEmployeeSuccess,
    createEmployeeFailure,
    getEmployees,
    getEmployeesSuccess,
    getEmployeesFailure,
    updateEmployee,
    updateEmployeeSuccess,
    updateEmployeeFailure,
    deleteEmployee,
    deleteEmployeeSuccess,
    deleteEmployeeFailure,
    resetEmployee
} = employeeSlice.actions;

export default employeeSlice.reducer;
