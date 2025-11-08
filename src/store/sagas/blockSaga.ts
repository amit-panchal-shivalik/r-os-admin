import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createBlock,
    createBlockSuccess,
    createBlockFailure,
    getBlocks,
    getBlocksSuccess,
    getBlocksFailure,
    updateBlock,
    updateBlockSuccess,
    updateBlockFailure,
    deleteBlock,
    deleteBlockSuccess,
    deleteBlockFailure
} from '../slices/blockSlice';
import {
    createBlockApi,
    getBlocksBySocietyApi,
    updateBlockApi,
    deleteBlockApi
} from '../../apis/block';

// Create Block
function* handleCreateBlock(action: PayloadAction<any>) {
    try {
        const response: any = yield call(createBlockApi, action.payload);
        yield put(createBlockSuccess(response.data));
    } catch (error: any) {
        yield put(createBlockFailure(error.message || 'An error occurred'));
    }
}

// Get Blocks
function* handleGetBlocks(action: PayloadAction<any>) {
    try {
        const { societyId, ...params } = action.payload;
        const response: any = yield call(getBlocksBySocietyApi, societyId, params);
        yield put(getBlocksSuccess(response.data));
    } catch (error: any) {
        yield put(getBlocksFailure(error.message || 'An error occurred'));
    }
}

// Update Block
function* handleUpdateBlock(action: PayloadAction<any>) {
    try {
        const { id, ...data } = action.payload;
        const response: any = yield call(updateBlockApi, id, data);
        yield put(updateBlockSuccess(response.data));
    } catch (error: any) {
        yield put(updateBlockFailure(error.message || 'An error occurred'));
    }
}

// Delete Block
function* handleDeleteBlock(action: PayloadAction<any>) {
    try {
        const { id } = action.payload;
        yield call(deleteBlockApi, id);
        yield put(deleteBlockSuccess(null));
    } catch (error: any) {
        yield put(deleteBlockFailure(error.message || 'An error occurred'));
    }
}

function* blockSaga() {
    yield takeLatest(createBlock.type, handleCreateBlock);
    yield takeLatest(getBlocks.type, handleGetBlocks);
    yield takeLatest(updateBlock.type, handleUpdateBlock);
    yield takeLatest(deleteBlock.type, handleDeleteBlock);
}

export default blockSaga;