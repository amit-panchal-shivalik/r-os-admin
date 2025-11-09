import { takeLatest, put, call, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { verifyOTP, verifyOTPSuccess, verifyOTPFailure } from '../slices/otpSlice';
import { superAdminVerifyOTPApi, buildingAdminVerifyOTPApi } from '../../apis/auth';
import { VerifyOTPPayload, BuildingAdminVerifyOTPPayload } from '@/types/LoginTypes';

// Saga to handle OTP verification
function* handleVerifyOTP(action: PayloadAction<VerifyOTPPayload | BuildingAdminVerifyOTPPayload>) {
    try {
        // Check if it's building admin OTP (has buildingId)
        const isBuildingAdmin = 'buildingId' in action.payload;
        
        let response: any;
        if (isBuildingAdmin) {
            response = yield call(buildingAdminVerifyOTPApi, action.payload as BuildingAdminVerifyOTPPayload);
        } else {
            response = yield call(superAdminVerifyOTPApi, action.payload as VerifyOTPPayload);
        }
        
        yield put(verifyOTPSuccess(response));
    } catch (error: any) {
        yield put(verifyOTPFailure(error.message || 'An error occurred'));
    }
}

function* otpSaga() {
    yield takeLatest(verifyOTP.type, handleVerifyOTP);
}

export default otpSaga;