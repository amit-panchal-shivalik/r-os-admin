import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    updateBuilding,
    updateBuildingSuccess,
    updateBuildingFailure,
} from '../slices/buildingSlice';
import { updateBuildingApi, UpdateBuildingPayload } from '../../apis/building';

function* handleUpdateBuilding(action: PayloadAction<UpdateBuildingPayload>) {
    try {
        const building: any = yield call(updateBuildingApi, action.payload);
        yield put(updateBuildingSuccess(building));
    } catch (error: any) {
        yield put(updateBuildingFailure(error.message || 'An error occurred'));
    }
}

function* buildingSaga() {
    yield takeLatest(updateBuilding.type, handleUpdateBuilding);
}

export default buildingSaga;

