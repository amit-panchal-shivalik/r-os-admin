

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MapStyleKey = 'streets' | 'satellite' | 'terrain' | string;

interface MapState {
  center: [number, number];
  zoom: number;
  style: MapStyleKey;
  isLayerMenuOpen: boolean;
  searchQuery: string;
  status: 'idle' | 'pending' | 'complete' | 'failed';
}

const initialState: MapState = {
  center: [72.5714, 23.0225], // default center (lon, lat)
  zoom: 12,
  style: 'satellite',
  isLayerMenuOpen: false,
  searchQuery: '',
  status: 'idle',
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    initializeMap(state) {
      state.status = 'pending';
    },
    initializeMapSuccess(state) {
      state.status = 'complete';
    },
    initializeMapFailure(state) {
      state.status = 'failed';
    },

    setCenter(state, action: PayloadAction<[number, number]>) {
      state.center = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    setStyle(state, action: PayloadAction<MapStyleKey>) {
      state.style = action.payload;
    },

    toggleLayerMenu(state) {
      state.isLayerMenuOpen = !state.isLayerMenuOpen;
    },
    setLayerMenu(state, action: PayloadAction<boolean>) {
      state.isLayerMenuOpen = action.payload;
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },

    resetMapState(state) {
      state.center = initialState.center;
      state.zoom = initialState.zoom;
      state.style = initialState.style;
      state.isLayerMenuOpen = initialState.isLayerMenuOpen;
      state.searchQuery = initialState.searchQuery;
      state.status = 'idle';
    },
  },
});

export const {
  initializeMap,
  initializeMapSuccess,
  initializeMapFailure,
  setCenter,
  setZoom,
  setStyle,
  toggleLayerMenu,
  setLayerMenu,
  setSearchQuery,
  resetMapState,
} = mapSlice.actions;

export default mapSlice.reducer;
