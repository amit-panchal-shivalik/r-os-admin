import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { verifyOTP, verifyOTPSuccess, verifyOTPFailure } from '../slices/otpSlice';
import { verifyOTPApi } from '../../apis/auth';
import { VerifyOtpRequest, OtpVerifyResponse } from '@/types/OTPTypes';

// Saga to handle user Verify OTP
function* handleVerifyOTP(action: PayloadAction<VerifyOtpRequest>) {
    try {
        // Call the verifyOTPApi API function
        const response: OtpVerifyResponse = yield call(verifyOTPApi, action.payload);
        // Dispatch the verifyOTPSuccess action
        yield put(verifyOTPSuccess(response));
    } catch (error: any) {
        // If there is an error, dispatch the verifyOTPFailure action with the error message
        yield put(verifyOTPFailure(error.message || 'An error occurred'));
    }
}

function* verifyOTPSaga() {
    // Listen for the handleVerifyOTP action and call the handleVerifyOTP saga when dispatched
    yield takeLatest(verifyOTP.type, handleVerifyOTP);
}

export default verifyOTPSaga;
