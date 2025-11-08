import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createUnit,
    createUnitSuccess,
    createUnitFailure,
    getUnits,
    getUnitsSuccess,
    getUnitsFailure,
    updateUnitStatus,
    updateUnitStatusSuccess,
    updateUnitStatusFailure
} from '../slices/unitSlice';
import {
    createUnitApi,
    getUnitsByFloorApi,
    getUnitsByBlockApi,
    updateUnitStatusApi
} from '../../apis/unit';

// Create Unit
function* handleCreateUnit(action: PayloadAction<any>) {
    try {
        const response: any = yield call(createUnitApi, action.payload);
        yield put(createUnitSuccess(response.data));
    } catch (error: any) {
        yield put(createUnitFailure(error.message || 'An error occurred'));
    }
}

// Get Units
function* handleGetUnits(action: PayloadAction<any>) {
    try {
        const { floorId, blockId, ...params } = action.payload;
        let response: any;
        
        if (floorId) {
            response = yield call(getUnitsByFloorApi, floorId, params);
        } else if (blockId) {
            response = yield call(getUnitsByBlockApi, blockId, params);
        } else {
            throw new Error('Either floorId or blockId is required');
        }
        
        yield put(getUnitsSuccess(response.data));
    } catch (error: any) {
        yield put(getUnitsFailure(error.message || 'An error occurred'));
    }
}

// Update Unit Status
function* handleUpdateUnitStatus(action: PayloadAction<any>) {
    try {
        const { id, ...data } = action.payload;
        const response: any = yield call(updateUnitStatusApi, id, data);
        yield put(updateUnitStatusSuccess(response.data));
    } catch (error: any) {
        yield put(updateUnitStatusFailure(error.message || 'An error occurred'));
    }
}

function* unitSaga() {
    yield takeLatest(createUnit.type, handleCreateUnit);
    yield takeLatest(getUnits.type, handleGetUnits);
    yield takeLatest(updateUnitStatus.type, handleUpdateUnitStatus);
}

export default unitSaga;