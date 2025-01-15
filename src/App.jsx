import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from "./LogIn";
import AddTask from "./AddTask";
import SignUp from "./SignUp";
import { GlobalProvider, useGlobalContext } from './GlobalProvider';

function App() {
    const { globalVariable, updateGlobalState } = useGlobalContext();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleLoginSuccess = (user) => {
        setIsLoggedIn(true);
        updateGlobalState('isLoggedIn', true);
        updateGlobalState('user', user);
    };

    const handleSignUpSuccess = () => {
        setIsSignedUp(true);
        setShowSignUp(false);
        updateGlobalState('isSignedUp', true);
        updateGlobalState('showSignUp', false);
    };

    const handleCreateAccount = () => {
        setShowSignUp(true);
        updateGlobalState('showSignUp', true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUp onSignUpSuccess={handleSignUpSuccess} />} />
                <Route path="/addtask" element={<AddTask />} />
                <Route path="/" element={
                    globalVariable.isLoggedIn ? (
                        <AddTask />
                    ) : globalVariable.showSignUp ? (
                        <SignUp onSignUpSuccess={handleSignUpSuccess} />
                    ) : (
                        <LogIn onLoginSuccess={handleLoginSuccess} onCreateAccount={handleCreateAccount} />
                    )
                } />
            </Routes>
        </Router>
    );
}

export default () => (
    <GlobalProvider>
        <App />
    </GlobalProvider>
);
