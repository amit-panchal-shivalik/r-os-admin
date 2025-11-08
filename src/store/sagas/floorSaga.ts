import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createFloors,
    createFloorsSuccess,
    createFloorsFailure,
    getFloors,
    getFloorsSuccess,
    getFloorsFailure
} from '../slices/floorSlice';
import {
    createFloorsApi,
    getFloorsByBlockApi
} from '../../apis/floor';

// Create Floors
function* handleCreateFloors(action: PayloadAction<any>) {
    try {
        const response: any = yield call(createFloorsApi, action.payload);
        yield put(createFloorsSuccess(response.data));
    } catch (error: any) {
        yield put(createFloorsFailure(error.message || 'An error occurred'));
    }
}

// Get Floors
function* handleGetFloors(action: PayloadAction<any>) {
    try {
        const { blockId, ...params } = action.payload;
        const response: any = yield call(getFloorsByBlockApi, blockId, params);
        yield put(getFloorsSuccess(response.data));
    } catch (error: any) {
        yield put(getFloorsFailure(error.message || 'An error occurred'));
    }
}

function* floorSaga() {
    yield takeLatest(createFloors.type, handleCreateFloors);
    yield takeLatest(getFloors.type, handleGetFloors);
}

export default floorSaga;