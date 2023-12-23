"use client"

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: {
        duration: 0
    }
}

export const timerSlice = createSlice({
    name: 'color',
    initialState,
    reducers: {
        setDuration: (_, action) => {
            return {
                value: {
                    duration: action.payload
                }
            }
        }
    }
})

export const { setDuration } = timerSlice.actions;
export default timerSlice.reducer;