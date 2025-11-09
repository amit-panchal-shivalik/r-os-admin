import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    getBuilding,
    getBuildingSuccess,
    getBuildingFailure,
    updateBuilding,
    updateBuildingSuccess,
    updateBuildingFailure,
} from '../slices/buildingSlice';
import { getBuildingApi, updateBuildingApi, UpdateBuildingPayload } from '../../apis/building';

function* handleGetBuilding(action: PayloadAction<string>) {
    try {
        const building: any = yield call(getBuildingApi, action.payload);
        yield put(getBuildingSuccess(building));
    } catch (error: any) {
        yield put(getBuildingFailure(error.message || 'An error occurred'));
    }
}

function* handleUpdateBuilding(action: PayloadAction<UpdateBuildingPayload>) {
    try {
        const building: any = yield call(updateBuildingApi, action.payload);
        yield put(updateBuildingSuccess(building));
    } catch (error: any) {
        yield put(updateBuildingFailure(error.message || 'An error occurred'));
    }
}

function* buildingSaga() {
    yield takeLatest(getBuilding.type, handleGetBuilding);
    yield takeLatest(updateBuilding.type, handleUpdateBuilding);
}

export default buildingSaga;

