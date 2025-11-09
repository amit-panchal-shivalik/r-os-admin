import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Login User Data
    user: null,
    error: null,
    status: 'idle', // idle, pending, complete, failed
    userType: null, // 'superadmin' or 'buildingadmin'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Super Admin Login Actions
        superAdminLogin(state, action) {
            state.status = 'pending';
            state.userType = 'superadmin';
        },
        superAdminLoginSuccess(state, action) {
            state.user = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        superAdminLoginFailure(state, action) {
            state.user = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Building Admin Login Actions
        buildingAdminLogin(state, action) {
            state.status = 'pending';
            state.userType = 'buildingadmin';
        },
        buildingAdminLoginSuccess(state, action) {
            state.user = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        buildingAdminLoginFailure(state, action) {
            state.user = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reset
        resetAuth(state) {
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    superAdminLogin,
    superAdminLoginSuccess,
    superAdminLoginFailure,
    buildingAdminLogin,
    buildingAdminLoginSuccess,
    buildingAdminLoginFailure,
    resetAuth
} = authSlice.actions;

export default authSlice.reducer;