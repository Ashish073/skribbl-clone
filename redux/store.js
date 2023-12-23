import { configureStore } from '@reduxjs/toolkit';
import toolSlice from './slices/toolSlice';
import colorSlice from './slices/colorSlice';
import brushSlice from './slices/brushSlice';
import timerSlice from './slices/timerSlice';
import roomSlice from './slices/roomSlice';

export const store = configureStore({
    reducer: {
        toolSlice,
        colorSlice,
        brushSlice,
        timerSlice,
        roomSlice
    }
});