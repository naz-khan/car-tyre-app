import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import { RouterProvider } from 'react-router-dom';
import router from './route/router';
import store from "./store/index";
import { setAuthUser } from './store/authSlice';
import Axios from 'axios';
import './css/global.css';

Axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
Axios.interceptors.request.use(function (config) {
    const stateUser = store.getState().auth.user;
    var user = stateUser ? stateUser : JSON.parse(localStorage.getItem("authUser"));
    var token = user !== null && user.accessToken !== undefined ? user.accessToken : "";
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
}, function (error) {
    return Promise.reject(error);
});

Axios.interceptors.response.use((response) => {
    return response;
}, async function (error) {
    const originalRequest = error.config;

    if (error.response) {
        var isAuthorisationError = error.response.status === 403 || error.response.status === 401;

        if (isAuthorisationError && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                var user = await RefreshToken();
                var token = user !== null && user.accessToken !== undefined ? user.accessToken : "";
                Axios.defaults.headers.Authorization = 'Bearer ' + token;

                // Update the original request's headers with the new token
                originalRequest.headers.Authorization = 'Bearer ' + token;
                if (originalRequest.data && typeof originalRequest.data === 'string') {
                    originalRequest.data = JSON.parse(originalRequest.data);
                }

                return Axios(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
    } else if (error.request) {
        // The request was made but no response was received
    } else {
        // Something happened in setting up the request that triggered an Error
    }

    return Promise.reject(error);
});

async function RefreshToken() {
    const stateUser = store.getState().auth.user;
    let currentUserData = stateUser ? stateUser : JSON.parse(localStorage.getItem("authUser"));
    var tokenRequestPayload = { refreshToken: currentUserData.refreshToken };

    try {
        const response = await Axios.post('Auth/refresh-token', tokenRequestPayload);
        const user = response.data;
        store.dispatch(setAuthUser(user));
        return user;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            // Redirect to the login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
}

createRoot(document.getElementById('root')).render(
    //<StrictMode>
    //    <Provider store={store}>
    //        <RouterProvider router={router} />
    //    </Provider>
    //</StrictMode>
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
);
