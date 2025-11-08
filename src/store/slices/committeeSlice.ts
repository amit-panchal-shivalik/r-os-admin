import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    members: [],
    member: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const committeeSlice = createSlice({
    name: 'committee',
    initialState,
    reducers: {
        createCommitteeMember(state, action) {
            state.status = 'pending';
        },
        createCommitteeMemberSuccess(state, action) {
            state.member = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createCommitteeMemberFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getCommitteeMembers(state, action) {
            state.status = 'pending';
        },
        getCommitteeMembersSuccess(state, action) {
            state.members = action.payload.members || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getCommitteeMembersFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateCommitteeMember(state, action) {
            state.status = 'pending';
        },
        updateCommitteeMemberSuccess(state, action) {
            state.member = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateCommitteeMemberFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteCommitteeMember(state, action) {
            state.status = 'pending';
        },
        deleteCommitteeMemberSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteCommitteeMemberFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetCommittee(state) {
            state.status = 'idle';
            state.error = null;
            state.member = null;
        },
    },
});

export const {
    createCommitteeMember,
    createCommitteeMemberSuccess,
    createCommitteeMemberFailure,
    getCommitteeMembers,
    getCommitteeMembersSuccess,
    getCommitteeMembersFailure,
    updateCommitteeMember,
    updateCommitteeMemberSuccess,
    updateCommitteeMemberFailure,
    deleteCommitteeMember,
    deleteCommitteeMemberSuccess,
    deleteCommitteeMemberFailure,
    resetCommittee
} = committeeSlice.actions;

export default committeeSlice.reducer;
