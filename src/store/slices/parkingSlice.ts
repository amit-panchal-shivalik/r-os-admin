import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    areas: [],
    area: null,
    spots: [],
    spot: null,
    requests: [],
    request: null,
    dashboard: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const parkingSlice = createSlice({
    name: 'parking',
    initialState,
    reducers: {
        // Parking Areas
        createParkingArea(state, action) {
            state.status = 'pending';
        },
        createParkingAreaSuccess(state, action) {
            state.area = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createParkingAreaFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getParkingAreas(state, action) {
            state.status = 'pending';
        },
        getParkingAreasSuccess(state, action) {
            state.areas = action.payload.areas || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getParkingAreasFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateParkingArea(state, action) {
            state.status = 'pending';
        },
        updateParkingAreaSuccess(state, action) {
            state.area = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateParkingAreaFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteParkingArea(state, action) {
            state.status = 'pending';
        },
        deleteParkingAreaSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteParkingAreaFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Parking Spots
        createParkingSpot(state, action) {
            state.status = 'pending';
        },
        createParkingSpotSuccess(state, action) {
            state.spot = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createParkingSpotFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getParkingSpots(state, action) {
            state.status = 'pending';
        },
        getParkingSpotsSuccess(state, action) {
            state.spots = action.payload.spots || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getParkingSpotsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Parking Requests
        getParkingDashboard(state, action) {
            state.status = 'pending';
        },
        getParkingDashboardSuccess(state, action) {
            state.dashboard = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getParkingDashboardFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getParkingRequests(state, action) {
            state.status = 'pending';
        },
        getParkingRequestsSuccess(state, action) {
            state.requests = action.payload.requests || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getParkingRequestsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        approveParkingRequest(state, action) {
            state.status = 'pending';
        },
        approveParkingRequestSuccess(state, action) {
            state.request = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        approveParkingRequestFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        rejectParkingRequest(state, action) {
            state.status = 'pending';
        },
        rejectParkingRequestSuccess(state, action) {
            state.request = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        rejectParkingRequestFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetParking(state) {
            state.status = 'idle';
            state.error = null;
            state.area = null;
            state.spot = null;
            state.request = null;
        },
    },
});

export const {
    createParkingArea,
    createParkingAreaSuccess,
    createParkingAreaFailure,
    getParkingAreas,
    getParkingAreasSuccess,
    getParkingAreasFailure,
    updateParkingArea,
    updateParkingAreaSuccess,
    updateParkingAreaFailure,
    deleteParkingArea,
    deleteParkingAreaSuccess,
    deleteParkingAreaFailure,
    createParkingSpot,
    createParkingSpotSuccess,
    createParkingSpotFailure,
    getParkingSpots,
    getParkingSpotsSuccess,
    getParkingSpotsFailure,
    getParkingDashboard,
    getParkingDashboardSuccess,
    getParkingDashboardFailure,
    getParkingRequests,
    getParkingRequestsSuccess,
    getParkingRequestsFailure,
    approveParkingRequest,
    approveParkingRequestSuccess,
    approveParkingRequestFailure,
    rejectParkingRequest,
    rejectParkingRequestSuccess,
    rejectParkingRequestFailure,
    resetParking
} = parkingSlice.actions;

export default parkingSlice.reducer;
