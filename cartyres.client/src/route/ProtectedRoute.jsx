import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { setAuthUser } from '../store/authSlice'; // Assuming you have this action to set the user

const ProtectedRoute = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true); // To handle loading state

    useEffect(() => {
        // Check localStorage for user if Redux state doesn't have it
        if (!user) {
            const localStorageUser = JSON.parse(localStorage.getItem("authUser"));
            if (localStorageUser) {
                // If user data exists in localStorage, dispatch to Redux
                dispatch(setAuthUser({ user: localStorageUser }));
            }
        }
        setLoading(false); // Stop loading once the check is done
    }, [dispatch, user]); // Only re-run if `dispatch` or `user` changes

    // Show a loading state while checking if user is authenticated
    if (loading) {
        return <div>Loading...</div>;
    }

    // If the user is not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Render the children (nested routes) if authenticated
    return <Outlet />;
};

export default ProtectedRoute;