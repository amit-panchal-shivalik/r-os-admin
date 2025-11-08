import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import otpSaga from './otpSaga';
import buildingSaga from './buildingSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    otpSaga(),
    buildingSaga(),
  ]);
}
