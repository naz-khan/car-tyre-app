import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from 'antd';

import { setAuthUser } from "../store/authSlice";
import "../css/login.css";
import logo from '../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Hook for navigation

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear any previous error messages
        setLoading(true);

        try {
            // Make API call to authenticate the user
            const response = await axios.post("Auth/login", { Email: username, Password: password });

            // Assuming the response contains the token
            const user = response.data;

            // Dispatch tokens to Redux store
            dispatch(setAuthUser(user));

            // Redirect user to the dashboard or another page
            navigate("/home");
            setLoading(false);
        } catch (error) {
            // Handle errors (e.g., invalid credentials)
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again later.");
            }

            setLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="logo-container">
                    <img className="logo" src={logo} alt="logo" />
                    <h1>JavaNrd</h1>
                </div>
                <h4>Fast and Easy Product Management</h4>
                <h2>Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <Button type="primary" loading={loading} onClick={handleLogin} htmlType="submit">
                        Sign In
                    </Button>
                </form>
                <p><a className="forgot-password" href="/register">Forgot Password?</a></p>
            </div>
        </div>

    );
};

export default Login;