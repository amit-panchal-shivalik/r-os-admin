import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    complaints: [],
    complaint: null,
    stats: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const complaintSlice = createSlice({
    name: 'complaint',
    initialState,
    reducers: {
        createComplaint(state, action) {
            state.status = 'pending';
        },
        createComplaintSuccess(state, action) {
            state.complaint = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createComplaintFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getComplaints(state, action) {
            state.status = 'pending';
        },
        getComplaintsSuccess(state, action) {
            state.complaints = action.payload.complaints || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getComplaintsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateComplaintStatus(state, action) {
            state.status = 'pending';
        },
        updateComplaintStatusSuccess(state, action) {
            state.complaint = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateComplaintStatusFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        addComplaintFollowUp(state, action) {
            state.status = 'pending';
        },
        addComplaintFollowUpSuccess(state, action) {
            state.complaint = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        addComplaintFollowUpFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getComplaintStats(state, action) {
            state.status = 'pending';
        },
        getComplaintStatsSuccess(state, action) {
            state.stats = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getComplaintStatsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteComplaint(state, action) {
            state.status = 'pending';
        },
        deleteComplaintSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteComplaintFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetComplaint(state) {
            state.status = 'idle';
            state.error = null;
            state.complaint = null;
        },
    },
});

export const {
    createComplaint,
    createComplaintSuccess,
    createComplaintFailure,
    getComplaints,
    getComplaintsSuccess,
    getComplaintsFailure,
    updateComplaintStatus,
    updateComplaintStatusSuccess,
    updateComplaintStatusFailure,
    addComplaintFollowUp,
    addComplaintFollowUpSuccess,
    addComplaintFollowUpFailure,
    getComplaintStats,
    getComplaintStatsSuccess,
    getComplaintStatsFailure,
    deleteComplaint,
    deleteComplaintSuccess,
    deleteComplaintFailure,
    resetComplaint
} = complaintSlice.actions;

export default complaintSlice.reducer;
