// AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Create context
const AuthContext = createContext();

// Provider to wrap around your app
export const AuthProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false); // Default to false (light mode)

    // Toggle dark mode
    const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);

    return (
        <AuthContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use darkMode
export const useDarkMode = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useDarkMode must be used within an AuthProvider');
    }
    return context;
};