"use client"

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: {
        color: '#000'
    }
}

export const colorSlice = createSlice({
    name: 'color',
    initialState,
    reducers: {
        setSelectedColor: (_, action) => {
            return {
                value: {
                    color: action.payload
                }
            }
        }
    }
})

export const { setSelectedColor } = colorSlice.actions;
export default colorSlice.reducer;