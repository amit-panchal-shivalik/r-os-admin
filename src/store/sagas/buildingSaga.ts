import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createBuilding,
    createBuildingSuccess,
    createBuildingFailure,
    getAllBuildings,
    getAllBuildingsSuccess,
    getAllBuildingsFailure,
    getBuildingById,
    getBuildingByIdSuccess,
    getBuildingByIdFailure
} from '../slices/buildingSlice';
import { createBuildingApi, getAllBuildingsApi, getBuildingByIdApi } from '../../apis/building';
import { CreateBuildingPayload } from '@/types/BuildingTypes';

// Saga to handle create building
function* handleCreateBuilding(action: PayloadAction<CreateBuildingPayload>) {
    try {
        const response: any = yield call(createBuildingApi, action.payload);
        yield put(createBuildingSuccess(response.data));
    } catch (error: any) {
        yield put(createBuildingFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle get all buildings
function* handleGetAllBuildings(action: PayloadAction<any>) {
    try {
        const response: any = yield call(getAllBuildingsApi, action.payload);
        yield put(getAllBuildingsSuccess(response.data));
    } catch (error: any) {
        yield put(getAllBuildingsFailure(error.message || 'An error occurred'));
    }
}

// Saga to handle get building by ID
function* handleGetBuildingById(action: PayloadAction<string>) {
    try {
        const response: any = yield call(getBuildingByIdApi, action.payload);
        // Handle both response structures: { data: {...} } or direct data
        const buildingData = response.data || response;
        yield put(getBuildingByIdSuccess(buildingData));
    } catch (error: any) {
        yield put(getBuildingByIdFailure(error.message || 'An error occurred'));
    }
}

function* buildingSaga() {
    yield takeLatest(createBuilding.type, handleCreateBuilding);
    yield takeLatest(getAllBuildings.type, handleGetAllBuildings);
    yield takeLatest(getBuildingById.type, handleGetBuildingById);
}

export default buildingSaga;