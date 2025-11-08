import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createNotice,
    createNoticeSuccess,
    createNoticeFailure,
    getNotices,
    getNoticesSuccess,
    getNoticesFailure,
    updateNotice,
    updateNoticeSuccess,
    updateNoticeFailure,
    publishNotice,
    publishNoticeSuccess,
    publishNoticeFailure,
    deleteNotice,
    deleteNoticeSuccess,
    deleteNoticeFailure
} from '../slices/noticeSlice';
import * as noticeApi from '../../apis/notices';

function* handleCreateNotice(action: PayloadAction<any>) {
    try {
        const response: any = yield call(noticeApi.createNotice, action.payload);
        yield put(createNoticeSuccess(response.data));
    } catch (error: any) {
        yield put(createNoticeFailure(error.message || 'An error occurred'));
    }
}

function* handleGetNotices(action: PayloadAction<any>) {
    try {
        const { buildingId } = action.payload;
        const response: any = yield call(noticeApi.getNotices, buildingId);
        yield put(getNoticesSuccess(response.data));
    } catch (error: any) {
        yield put(getNoticesFailure(error.message || 'An error occurred'));
    }
}

function* handleUpdateNotice(action: PayloadAction<any>) {
    try {
        const { id, ...data } = action.payload;
        const response: any = yield call(noticeApi.updateNotice, id, data);
        yield put(updateNoticeSuccess(response.data));
    } catch (error: any) {
        yield put(updateNoticeFailure(error.message || 'An error occurred'));
    }
}

function* handlePublishNotice(action: PayloadAction<any>) {
    try {
        const { id, noticeStatus } = action.payload;
        const response: any = yield call(noticeApi.publishNotice, id, noticeStatus);
        yield put(publishNoticeSuccess(response.data));
    } catch (error: any) {
        yield put(publishNoticeFailure(error.message || 'An error occurred'));
    }
}

function* handleDeleteNotice(action: PayloadAction<any>) {
    try {
        const { id } = action.payload;
        yield call(noticeApi.deleteNotice, id);
        yield put(deleteNoticeSuccess(null));
    } catch (error: any) {
        yield put(deleteNoticeFailure(error.message || 'An error occurred'));
    }
}

function* noticeSaga() {
    yield takeLatest(createNotice.type, handleCreateNotice);
    yield takeLatest(getNotices.type, handleGetNotices);
    yield takeLatest(updateNotice.type, handleUpdateNotice);
    yield takeLatest(publishNotice.type, handlePublishNotice);
    yield takeLatest(deleteNotice.type, handleDeleteNotice);
}

export default noticeSaga;
