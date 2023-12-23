import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: {
        size: '5'
    }
}

export const brushSlice = createSlice({
    name: 'brush',
    initialState,
    reducers: {
        setSelectedSize: (_, action) => {
            return {
                value: {
                    size: action.payload
                }
            }
        }
    }
})

export const { setSelectedSize } = brushSlice.actions;
export default brushSlice.reducer;