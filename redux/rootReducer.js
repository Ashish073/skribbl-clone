"use client"

import { combineReducers } from '@reduxjs/toolkit';
import toolSlice from './slices/toolSlice';
import colorSlice from './slices/colorSlice';
import brushSlice from './slices/brushSlice';
import timerSlice from './slices/timerSlice';
import roomSlice from './slices/roomSlice';

const rootReducer = combineReducers({
    toolSlice,
    colorSlice,
    brushSlice,
    timerSlice,
    roomSlice
});

export default rootReducer;