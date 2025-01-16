import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';


const LoginForm = ({ onLoginSuccess, onCreateAccount }) => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Access login function from context

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.status === 200) {
        login(data.user, data.token); // Store user data and token in context
        navigate('/addtask'); // Navigate to AddTask page
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#915f78] to-[#882054] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-6 text-[#882054] text-center">Log In</h2>
        
         <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input 
              className="w-full border-2 border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78] transition duration-200"
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <input 
              className="w-full border-2 border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78] transition duration-200"
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="w-full bg-[#915f78] text-white py-3 rounded-md transition-colors duration-300 hover:bg-[#8d738f] focus:outline-none focus:ring-2 focus:ring-[#915f78] focus:ring-offset-2">
            Log In
          </button>
        </form>
        
        <div className="my-8 flex items-center justify-between">
          <div className="border-t border-gray-300 flex-grow mr-3"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="border-t border-gray-300 flex-grow ml-3"></div>
        </div>

          <button 
            onClick={onCreateAccount} 
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-md transition-colors duration-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Create an Account
          </button>
        </div>
      </div>
  );
}

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired
};

export default LoginForm;