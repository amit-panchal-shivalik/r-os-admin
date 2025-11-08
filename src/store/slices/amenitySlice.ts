import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    amenities: [],
    amenity: null,
    slots: [],
    slot: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const amenitySlice = createSlice({
    name: 'amenity',
    initialState,
    reducers: {
        // Amenities
        createAmenity(state, action) {
            state.status = 'pending';
        },
        createAmenitySuccess(state, action) {
            state.amenity = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createAmenityFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getAmenities(state, action) {
            state.status = 'pending';
        },
        getAmenitiesSuccess(state, action) {
            state.amenities = action.payload.amenities || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getAmenitiesFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateAmenity(state, action) {
            state.status = 'pending';
        },
        updateAmenitySuccess(state, action) {
            state.amenity = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateAmenityFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteAmenity(state, action) {
            state.status = 'pending';
        },
        deleteAmenitySuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteAmenityFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Amenity Slots
        createAmenitySlot(state, action) {
            state.status = 'pending';
        },
        createAmenitySlotSuccess(state, action) {
            state.slot = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createAmenitySlotFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getAmenitySlots(state, action) {
            state.status = 'pending';
        },
        getAmenitySlotsSuccess(state, action) {
            state.slots = action.payload.slots || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getAmenitySlotsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateAmenitySlot(state, action) {
            state.status = 'pending';
        },
        updateAmenitySlotSuccess(state, action) {
            state.slot = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateAmenitySlotFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetAmenity(state) {
            state.status = 'idle';
            state.error = null;
            state.amenity = null;
            state.slot = null;
        },
    },
});

export const {
    createAmenity,
    createAmenitySuccess,
    createAmenityFailure,
    getAmenities,
    getAmenitiesSuccess,
    getAmenitiesFailure,
    updateAmenity,
    updateAmenitySuccess,
    updateAmenityFailure,
    deleteAmenity,
    deleteAmenitySuccess,
    deleteAmenityFailure,
    createAmenitySlot,
    createAmenitySlotSuccess,
    createAmenitySlotFailure,
    getAmenitySlots,
    getAmenitySlotsSuccess,
    getAmenitySlotsFailure,
    updateAmenitySlot,
    updateAmenitySlotSuccess,
    updateAmenitySlotFailure,
    resetAmenity
} = amenitySlice.actions;

export default amenitySlice.reducer;
