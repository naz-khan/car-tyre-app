import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: JSON.parse(localStorage.getItem("authUser")) || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthUser(state, action) {
            // Ensure the user state is updated correctly
            state.user = action.payload; // Remove ".user" if payload is the user object itself
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

