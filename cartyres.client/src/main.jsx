import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";

import { RouterProvider } from 'react-router-dom';
import router from './route/router';
import store from "./store/index";
const state = store.getState();

import Axios from 'axios'

import './css/global.css'

Axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
Axios.interceptors.request.use(function (config) {

    var user = state.auth.user;
    var token = user !== null && user.accessToken !== undefined ? user.accessToken : "";

    config.headers.Authorization = token ? `Bearer ${token}` : ''

    return config
}, function (error) {
    return Promise.reject(error)
})
Axios.interceptors.response.use(
    response => response,
    error => {
        // Handle errors globally
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
  </StrictMode>
)
