import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authSlice from './slices/authSlice';
import otpSlice from './slices/otpSlice';
import buildingSlice from './slices/buildingSlice';
import blockSlice from './slices/blockSlice';
import floorSlice from './slices/floorSlice';
import unitSlice from './slices/unitSlice';
import noticeSlice from './slices/noticeSlice';
import amenitySlice from './slices/amenitySlice';
import complaintSlice from './slices/complaintSlice';
import committeeSlice from './slices/committeeSlice';
import employeeSlice from './slices/employeeSlice';
import eventSlice from './slices/eventSlice';
import visitorSlice from './slices/visitorSlice';
import maintenanceSlice from './slices/maintenanceSlice';
import parkingSlice from './slices/parkingSlice';
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
    notice: noticeSlice,
    amenity: amenitySlice,
    complaint: complaintSlice,
    committee: committeeSlice,
    employee: employeeSlice,
    event: eventSlice,
    visitor: visitorSlice,
    maintenance: maintenanceSlice,
    parking: parkingSlice,
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