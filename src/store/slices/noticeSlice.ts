import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notices: [],
    notice: null,
    error: null,
    status: 'idle', // idle, pending, complete, failed
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const noticeSlice = createSlice({
    name: 'notice',
    initialState,
    reducers: {
        // Create Notice
        createNotice(state, action) {
            state.status = 'pending';
        },
        createNoticeSuccess(state, action) {
            state.notice = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createNoticeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Get Notices
        getNotices(state, action) {
            state.status = 'pending';
        },
        getNoticesSuccess(state, action) {
            state.notices = action.payload.notices || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getNoticesFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Update Notice
        updateNotice(state, action) {
            state.status = 'pending';
        },
        updateNoticeSuccess(state, action) {
            state.notice = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateNoticeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Publish Notice
        publishNotice(state, action) {
            state.status = 'pending';
        },
        publishNoticeSuccess(state, action) {
            state.notice = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        publishNoticeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Delete Notice
        deleteNotice(state, action) {
            state.status = 'pending';
        },
        deleteNoticeSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteNoticeFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Reset
        resetNotice(state) {
            state.status = 'idle';
            state.error = null;
            state.notice = null;
        },
    },
});

export const {
    createNotice,
    createNoticeSuccess,
    createNoticeFailure,
    getNotices,
    getNoticesSuccess,
    getNoticesFailure,
    updateNotice,
    updateNoticeSuccess,
    updateNoticeFailure,
    publishNotice,
    publishNoticeSuccess,
    publishNoticeFailure,
    deleteNotice,
    deleteNoticeSuccess,
    deleteNoticeFailure,
    resetNotice
} = noticeSlice.actions;

export default noticeSlice.reducer;
