import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token); // Save the token in localStorage (optional)
  };
  const signup = (newUser, token) => {
    setUser(newUser); // `newUser` contains `id`, `firstName`, `lastName`, etc.
    localStorage.setItem('token', token); // Save the token in localStorage
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
