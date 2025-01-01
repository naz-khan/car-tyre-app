import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../router/ProtectedRoute'; // Import ProtectedRoute component

import store from "../store/index"; // Redux store
const state = store.getState(); // Get the initial state

import Home from '../views/Home';
import TyreSearchResults from '../views/TyreSearchResults';
import Nav from '../components/Nav';

const Layout = ({ children }) => (
    <div>
        <Nav />
        {children}
    </div>
);

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Layout>
                <Home />
            </Layout>
        ),
        index: true
    },
    {
        path: 'search-results',
        element: (
            <Layout>
                <TyreSearchResults />
            </Layout>
        ),
    },
    {
        path: '*',
        element: (
            <Layout>
                <p>404 Error - Nothing here...</p>
            </Layout>
        )
    }
]);

export default router;