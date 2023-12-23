"use client";

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import socket from '@/services/socket';

const initialState = {
    value: {
        roomId: null,
        socketId: null,
        roomData: [],
        roomSettings: {
            players: 6,
            rounds: 4,
            drawTime: 60,
            hints: 1,
            isStarted: false
        },
        isStarted: false
    },
    isLoading: false,
    error: null,
};

export const joinRoom = createAsyncThunk('room/joinRoom', async ({ roomId, username, roomData }) => {
    try {
        const response = await new Promise((resolve, reject) => {
            socket.emit('joinRoom', { roomId, username }, (response) => {
                if (response && response.roomId && response.socketId) {
                    resolve(response);
                } else {
                    reject({ error: 'Invalid response from the server.' });
                }
            });
        });
        return response;
    } catch (error) {
        throw error;
    }
});

export const createRoom = createAsyncThunk('room/createRoom', async ({ username }) => {
    try {
        const response = await new Promise((resolve, reject) => {
            socket.emit('createRoom', { username }, (response) => {
                if (response && response.roomId && response.socketId) {
                    resolve(response);
                } else {
                    reject({ error: 'Invalid response from the server.' });
                }
            });
        });
        return response;
    } catch (error) {
        throw error;
    }
});

export const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setRoomSocketInfo: (state, action) => {
            state.value.roomId = action.payload.roomId;
            state.value.socketId = action.payload.socketId;
            state.value.roomData = action.payload.roomData;
        },
        setRoomData: (state, action) => {
            state.value.roomData = action.payload.roomData;
        },
        setRoomSettings: (state, action) => {
            state.value.roomSettings = action.payload.roomSettings;
        },
        resetRoomData: (state) => {
            state = initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(joinRoom.pending, (state) => {
                state.isLoading = true;
                console.log('Joining room - Pending');
            })
            .addCase(joinRoom.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.value.roomId = action.payload.roomId;
                state.value.socketId = action.payload.socketId;
                state.value.roomData = action.payload.roomData;
                console.log('Joining room - Fulfilled');
            })
            .addCase(joinRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.value = initialState.value;
                state.error = action.error.message;
                console.log('Joining room - Rejected');
            })
            .addCase(createRoom.pending, (state) => {
                state.isLoading = true;
                console.log('Create room - Pending');
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.value.roomId = action.payload.roomId;
                state.value.socketId = action.payload.socketId;
                state.value.roomData = action.payload.roomData;
                console.log('Create room - Fulfilled');
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.value = initialState.value;
                state.error = action.error.message;
                console.log('Create room - Rejected');
            });
    },
});

export const { setRoomSocketInfo, setRoomData, resetRoomData, setRoomSettings } = roomSlice.actions;
export default roomSlice.reducer;
