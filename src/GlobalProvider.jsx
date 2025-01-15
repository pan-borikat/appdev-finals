import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [globalVariable, setGlobalVariable] = useState({
        isLoggedIn: false,
        user: null,
        tasks: [],
        showSignUp: false,
    });

    const updateGlobalState = (key, value) => {
        setGlobalVariable((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <GlobalContext.Provider value={{ globalVariable, setGlobalVariable, updateGlobalState }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
