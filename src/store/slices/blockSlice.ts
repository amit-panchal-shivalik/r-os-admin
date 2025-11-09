import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    blocks: [],
    block: null,
    error: null,
    status: 'idle', // idle, pending, complete, failed
    pagination: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
    },
};

const blockSlice = createSlice({
    name: 'block',
    initialState,
    reducers: {
        // Create Block
        createBlock(state, action) {
            state.status = 'pending';
        },
        createBlockSuccess(state, action) {
            state.block = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        createBlockFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Get Blocks
        getBlocks(state, action) {
            state.status = 'pending';
        },
        getBlocksSuccess(state, action) {
            state.blocks = action.payload.blocks;
            state.pagination = action.payload.pagination;
            state.error = null;
            state.status = 'complete';
        },
        getBlocksFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Update Block
        updateBlock(state, action) {
            state.status = 'pending';
        },
        updateBlockSuccess(state, action) {
            state.block = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        updateBlockFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Delete Block
        deleteBlock(state, action) {
            state.status = 'pending';
        },
        deleteBlockSuccess(state, action) {
            state.error = null;
            state.status = 'complete';
        },
        deleteBlockFailure(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },
        
        // Reset
        resetBlock(state) {
            state.status = 'idle';
            state.error = null;
            state.block = null;
        },
    },
});

export const {
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
    deleteBlockFailure,
    resetBlock
} = blockSlice.actions;

export default blockSlice.reducer;