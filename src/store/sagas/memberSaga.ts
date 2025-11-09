import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from '../slices/memberSlice';
import {
    getPendingMembersApi,
    getAllMembersApi,
    getMemberDetailsApi,
    approveMemberApi,
    rejectMemberApi,
} from '../../apis/members';

// Saga to handle get pending members
function* handleGetPendingMembers(action: PayloadAction<string>) {
    try {
        const buildingId = action.payload;
        const response: any = yield call(getPendingMembersApi, buildingId);
        yield put(getPendingMembersSuccess(response.data));
    } catch (error: any) {
        yield put(getPendingMembersFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle get all members
function* handleGetAllMembers(action: PayloadAction<{ buildingId: string; filters?: any }>) {
    try {
        const { buildingId, filters } = action.payload;
        const response: any = yield call(getAllMembersApi, buildingId, filters);
        yield put(getAllMembersSuccess(response.data));
    } catch (error: any) {
        yield put(getAllMembersFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle get member details
function* handleGetMemberDetails(action: PayloadAction<string>) {
    try {
        const memberId = action.payload;
        const response: any = yield call(getMemberDetailsApi, memberId);
        yield put(getMemberDetailsSuccess(response.data));
    } catch (error: any) {
        yield put(getMemberDetailsFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle approve member
function* handleApproveMember(action: PayloadAction<string>) {
    try {
        const memberId = action.payload;
        const response: any = yield call(approveMemberApi, memberId);
        yield put(approveMemberSuccess(response.data));
    } catch (error: any) {
        yield put(approveMemberFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle reject member
function* handleRejectMember(action: PayloadAction<{ memberId: string; reason?: string }>) {
    try {
        const { memberId, reason } = action.payload;
        const response: any = yield call(rejectMemberApi, memberId, reason);
        yield put(rejectMemberSuccess(response.data));
    } catch (error: any) {
        yield put(rejectMemberFailure(error.message || 'An error occurred'));
    }
}

function* memberSaga() {
    yield takeLatest(getPendingMembers.type, handleGetPendingMembers);
    yield takeLatest(getAllMembers.type, handleGetAllMembers);
    yield takeLatest(getMemberDetails.type, handleGetMemberDetails);
    yield takeLatest(approveMember.type, handleApproveMember);
    yield takeLatest(rejectMember.type, handleRejectMember);
}

export default memberSaga;
