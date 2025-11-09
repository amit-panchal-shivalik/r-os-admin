import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    visitors: [],
    todayVisitors: [],
    visitor: null,
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

const visitorSlice = createSlice({
    name: 'visitor',
    initialState,
    reducers: {
        createVisitor(state, action) {
            state.status = 'pending';
        },
        createVisitorSuccess(state, action) {
            state.visitor = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createVisitorFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getVisitors(state, action) {
            state.status = 'pending';
        },
        getVisitorsSuccess(state, action) {
            state.visitors = action.payload.visitors || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getVisitorsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getTodayVisitors(state, action) {
            state.status = 'pending';
        },
        getTodayVisitorsSuccess(state, action) {
            state.todayVisitors = action.payload.visitors || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getTodayVisitorsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getVisitorStats(state, action) {
            state.status = 'pending';
        },
        getVisitorStatsSuccess(state, action) {
            state.stats = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getVisitorStatsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateVisitor(state, action) {
            state.status = 'pending';
        },
        updateVisitorSuccess(state, action) {
            state.visitor = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateVisitorFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteVisitor(state, action) {
            state.status = 'pending';
        },
        deleteVisitorSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteVisitorFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetVisitor(state) {
            state.status = 'idle';
            state.error = null;
            state.visitor = null;
        },
    },
});

export const {
    createVisitor,
    createVisitorSuccess,
    createVisitorFailure,
    getVisitors,
    getVisitorsSuccess,
    getVisitorsFailure,
    getTodayVisitors,
    getTodayVisitorsSuccess,
    getTodayVisitorsFailure,
    getVisitorStats,
    getVisitorStatsSuccess,
    getVisitorStatsFailure,
    updateVisitor,
    updateVisitorSuccess,
    updateVisitorFailure,
    deleteVisitor,
    deleteVisitorSuccess,
    deleteVisitorFailure,
    resetVisitor
} = visitorSlice.actions;

export default visitorSlice.reducer;
