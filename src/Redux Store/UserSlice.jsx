import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
    name: 'user',
    initialState: {
        userData: {}
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        }
    }
});

export const { setUserData } = UserSlice.actions;

export default UserSlice.reducer;