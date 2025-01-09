import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLoginSuccess, onCreateAccount }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load the Facebook SDK script
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : '561348250031293',
        cookie     : true,
        xfbml      : true,
        version    : 'v11.0'
      });
      window.FB.AppEvents.logPageView();   
    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFBLogin = () => {
    window.FB.login(response => {
      if (response.authResponse) {
        console.log('Welcome! Fetching your information.... ');
        window.FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
          onLoginSuccess();
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/addtask');
  }

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
            />
          </div>
          
          <div>
            <input 
              className="w-full border-2 border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78] transition duration-200"
              type="password" 
              placeholder="Password"
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
        
        <div className="space-y-4">
          <button 
            onClick={handleFBLogin} 
            className="w-full bg-[#1877F2] text-white py-3 rounded-md transition-colors duration-300 hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2"
          >
            Log in with Facebook
          </button>
          <button 
            onClick={onCreateAccount} 
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-md transition-colors duration-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired
};

export default LoginForm;

