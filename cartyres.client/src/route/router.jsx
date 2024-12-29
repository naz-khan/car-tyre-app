import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../route/ProtectedRoute'; // Import ProtectedRoute component

import store from "../store/index"; // Redux store

const state = store.getState(); // Get the initial state

import Login from '../views/Login'; // Import Login component
import Home from '../views/Home'; // Import Home component
import Inventory from '../views/Inventory';
import NavLayout from '../components/NavLayout'; // Import Layout for protected routes

// Function to get the current user from Redux state
const getUser = () => {
    return state.auth.user;
}

// Function to check if the user is authenticated
const isAuthenticated = () => {
    const user = getUser();
    if (new Date(user.tokenExpiration) > new Date())
        return true;
    else
        return false;
}

// Create the router with dynamic authentication check
const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />, // Login page does not require layout
        index: true
    },
    {
        element: <ProtectedRoute isAuthenticated={isAuthenticated} />, // Pass the function that checks authentication dynamically
        children: [
            {
                path: '/',
                element: (
                    <NavLayout /> // Use NavLayout here
                ),
                children: [
                    {
                        path: 'home', // This means it's the default child of /home
                        element: <Home /> // Home component will be rendered inside NavLayout
                    },
                    {
                        path: '/inventory', // This means it's the default child of /home
                        element: <Inventory /> // Inventory component will be rendered inside NavLayout
                    }
                ]
            },
            // Add more protected routes as needed
        ]
    },
    {
        path: '*',
        element: <p>404 Error - Nothing here...</p> // 404 page
    }
]);

export default router;
