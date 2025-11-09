import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import otpSaga from './otpSaga';
import buildingSaga from './buildingSaga';
import blockSaga from './blockSaga';
import floorSaga from './floorSaga';
import unitSaga from './unitSaga';
import noticeSaga from './noticeSaga';
import memberSaga from './memberSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    otpSaga(),
    buildingSaga(),
    blockSaga(),
    floorSaga(),
    unitSaga(),
    noticeSaga(),
    memberSaga(),
  ]);
}