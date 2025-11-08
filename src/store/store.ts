import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authSlice from './slices/authSlice';
import otpSlice from './slices/otpSlice';
import buildingSlice from './slices/buildingSlice';
import blockSlice from './slices/blockSlice';
import floorSlice from './slices/floorSlice';
import unitSlice from './slices/unitSlice';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authSlice,
    otp: otpSlice,
    building: buildingSlice,
    block: blockSlice,
    floor: floorSlice,
    unit: unitSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;