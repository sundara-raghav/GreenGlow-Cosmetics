import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CustomerLogin.css'; // Add styling if needed
import { AppContext } from '../context/AppContext';

const CustomerLogin = () => {
    const navigate = useNavigate();
    const { login } = useContext(AppContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        
        // Validate password match for signup
        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        const endpoint = isLogin ? '/login' : '/signup';
        const payload = isLogin ? { email, password } : { email, password, name };

        try {
            console.log('Sending request to:', endpoint, 'with payload:', payload);
            const response = await fetch(`http://localhost:4242${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Response from server:', data);

            if (response.ok) {
                if (isLogin) {
                    console.log('Login successful, navigating to home page.');
                    // Create a user object with name and email
                    const userObj = {
                        email: email,
                        name: data.user?.name || email.split('@')[0],
                        role: 'client',
                        ...data.user
                    };
                    
                    // Store in context and localStorage
                    login(userObj);
                    setSuccessMessage('Login successful! Redirecting...');
                    setTimeout(() => {
                        navigate('/'); // Navigate to the home page after a short delay
                    }, 1500);
                } else {
                    setSuccessMessage('Signup successful! You can now log in.');
                    // Switch to login mode after successful signup
                    setTimeout(() => {
                        setIsLogin(true);
                    }, 1500);
                }
            } else {
                console.error('Error from server:', data.error);
                setError(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error during login/signup:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-login-container">
            <div className="login-card">
                <h2>{isLogin ? 'Customer Login' : 'Customer Signup'}</h2>
                
                {/* Error message */}
                {error && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
                
                {/* Success message */}
                {successMessage && (
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your name"
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
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
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            isLogin ? 'Login' : 'Signup'
                        )}
                    </button>
                </form>
                <div className="toggle-container">
                    <p>
                        {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setSuccessMessage('');
                        }}
                        className="toggle-button"
                        disabled={loading}
                    >
                        {isLogin ? 'Signup' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;