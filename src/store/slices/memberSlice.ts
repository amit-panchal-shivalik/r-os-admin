import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    members: [],
    pendingMembers: [],
    selectedMember: null,
    error: null,
    status: 'idle', // idle, pending, complete, failed
    
    filters: {
        status: null,
        memberType: null,
        search: '',
    },
    
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
};

const memberSlice = createSlice({
    name: 'member',
    initialState,
    reducers: {
        // Get Pending Members
        getPendingMembers(state, action) {
            state.status = 'pending';
        },
        getPendingMembersSuccess(state, action) {
            state.pendingMembers = action.payload.members;
            state.error = null;
            state.status = 'complete';
        },
        getPendingMembersFailure(state, action) {
            state.pendingMembers = [];
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get All Members
        getAllMembers(state, action) {
            state.status = 'pending';
        },
        getAllMembersSuccess(state, action) {
            state.members = action.payload.members;
            state.error = null;
            state.status = 'complete';
        },
        getAllMembersFailure(state, action) {
            state.members = [];
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get Member Details
        getMemberDetails(state, action) {
            state.status = 'pending';
        },
        getMemberDetailsSuccess(state, action) {
            state.selectedMember = action.payload.member;
            state.error = null;
            state.status = 'complete';
        },
        getMemberDetailsFailure(state, action) {
            state.selectedMember = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Approve Member
        approveMember(state, action) {
            state.status = 'pending';
        },
        approveMemberSuccess(state, action) {
            // Update member in lists
            const memberId = action.payload.member._id;
            state.pendingMembers = state.pendingMembers.filter(m => m._id !== memberId);
            state.members = state.members.map(m => 
                m._id === memberId ? action.payload.member : m
            );
            state.error = null;
            state.status = 'complete';
        },
        approveMemberFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reject Member
        rejectMember(state, action) {
            state.status = 'pending';
        },
        rejectMemberSuccess(state, action) {
            // Update member in lists
            const memberId = action.payload.member._id;
            state.pendingMembers = state.pendingMembers.filter(m => m._id !== memberId);
            state.members = state.members.map(m => 
                m._id === memberId ? action.payload.member : m
            );
            state.error = null;
            state.status = 'complete';
        },
        rejectMemberFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Set Filters
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Reset State
        resetMemberState(state) {
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const {
    getPendingMembers,
    getPendingMembersSuccess,
    getPendingMembersFailure,
    getAllMembers,
    getAllMembersSuccess,
    getAllMembersFailure,
    getMemberDetails,
    getMemberDetailsSuccess,
    getMemberDetailsFailure,
    approveMember,
    approveMemberSuccess,
    approveMemberFailure,
    rejectMember,
    rejectMemberSuccess,
    rejectMemberFailure,
    setFilters,
    resetMemberState,
} = memberSlice.actions;

export default memberSlice.reducer;
