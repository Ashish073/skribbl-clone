"use client"

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: {
        type: 'PENCIL'
    }
}

export const toolSlice = createSlice({
    name: 'tool',
    initialState,
    reducers: {
        setSelectedTool: (_, action) => {
            return {
                value: {
                    type: action.payload
                }
            }
        }
    }
})

export const { setSelectedTool } = toolSlice.actions;
export default toolSlice.reducer;