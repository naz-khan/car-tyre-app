import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: JSON.parse(localStorage.getItem("authUser")) || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthUser(state, action) {
            state.user = action.payload.user;
            localStorage.setItem("authUser", JSON.stringify(state.user));
        },
        clearAuthUser(state) {
            state.user = null;
            localStorage.removeItem("authUser");
        },
    },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;

export default authSlice.reducer;
