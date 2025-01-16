import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from "./LogIn";
import AddTask from "./AddTask";
import SignUp from "./SignUp";
import { AuthProvider } from './Auth'; // Import AuthProvider


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleSignUpSuccess = () => {
        setIsSignedUp(true);
        setShowSignUp(false);
    };

    const handleCreateAccount = () => {
        setShowSignUp(true);
    };

    return (
        <AuthProvider>
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUp onSignUpSuccess={handleSignUpSuccess} />} />
                <Route path="/addtask" element={<AddTask />} />
                <Route path="/" element={
                    isLoggedIn ? (
                        <AddTask />
                    ) : showSignUp ? (
                        <SignUp onSignUpSuccess={handleSignUpSuccess} />
                    ) : (
                        <LogIn 
                            onLoginSuccess={handleLoginSuccess} 
                            onCreateAccount={handleCreateAccount} 
                        />
                    )
                } />
            </Routes>
        </Router>
        </AuthProvider>
    );
}

export default App;
