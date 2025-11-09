import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    superAdminLogin,
    superAdminLoginSuccess,
    superAdminLoginFailure,
    buildingAdminLogin,
    buildingAdminLoginSuccess,
    buildingAdminLoginFailure
} from '../slices/authSlice';
import { superAdminSendOTPApi, buildingAdminSendOTPApi } from '../../apis/auth';
import { LoginPayload, BuildingAdminLoginPayload } from '@/types/LoginTypes';

// Saga to handle super admin login
function* handleSuperAdminLogin(action: PayloadAction<LoginPayload>) {
    try {
        const response: any = yield call(superAdminSendOTPApi, action.payload);
        yield put(superAdminLoginSuccess(response));
    } catch (error: any) {
        yield put(superAdminLoginFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle building admin login
function* handleBuildingAdminLogin(action: PayloadAction<BuildingAdminLoginPayload>) {
    try {
        const response: any = yield call(buildingAdminSendOTPApi, action.payload);
        yield put(buildingAdminLoginSuccess(response));
    } catch (error: any) {
        yield put(buildingAdminLoginFailure(error.message || 'An error occurred'));
    }
}

function* authSaga() {
    yield takeLatest(superAdminLogin.type, handleSuperAdminLogin);
    yield takeLatest(buildingAdminLogin.type, handleBuildingAdminLogin);
}

export default authSaga;