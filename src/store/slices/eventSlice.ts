import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    events: [],
    event: null,
    registrations: [],
    analytics: null,
    error: null,
    status: 'idle',
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        createEvent(state, action) {
            state.status = 'pending';
        },
        createEventSuccess(state, action) {
            state.event = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createEventFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getEvents(state, action) {
            state.status = 'pending';
        },
        getEventsSuccess(state, action) {
            state.events = action.payload.events || action.payload;
            state.pagination = action.payload.pagination || initialState.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getEventsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        updateEvent(state, action) {
            state.status = 'pending';
        },
        updateEventSuccess(state, action) {
            state.event = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateEventFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        publishEvent(state, action) {
            state.status = 'pending';
        },
        publishEventSuccess(state, action) {
            state.event = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        publishEventFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        deleteEvent(state, action) {
            state.status = 'pending';
        },
        deleteEventSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteEventFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getEventRegistrations(state, action) {
            state.status = 'pending';
        },
        getEventRegistrationsSuccess(state, action) {
            state.registrations = action.payload.registrations || action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getEventRegistrationsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        getEventAnalytics(state, action) {
            state.status = 'pending';
        },
        getEventAnalyticsSuccess(state, action) {
            state.analytics = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getEventAnalyticsFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        resetEvent(state) {
            state.status = 'idle';
            state.error = null;
            state.event = null;
        },
    },
});

export const {
    createEvent,
    createEventSuccess,
    createEventFailure,
    getEvents,
    getEventsSuccess,
    getEventsFailure,
    updateEvent,
    updateEventSuccess,
    updateEventFailure,
    publishEvent,
    publishEventSuccess,
    publishEventFailure,
    deleteEvent,
    deleteEventSuccess,
    deleteEventFailure,
    getEventRegistrations,
    getEventRegistrationsSuccess,
    getEventRegistrationsFailure,
    getEventAnalytics,
    getEventAnalyticsSuccess,
    getEventAnalyticsFailure,
    resetEvent
} = eventSlice.actions;

export default eventSlice.reducer;
