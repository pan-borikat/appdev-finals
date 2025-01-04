import React from 'react';

class LogIn extends React.Component {
    componentDidMount() {
        // Load the Facebook SDK script
        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : '561348250031293',
                cookie     : true,
                xfbml      : true,
                version    : 'v10.0'
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
    }

    handleFBLogin = () => {
        window.FB.login(response => {
            if (response.authResponse) {
                console.log('Welcome! Fetching your information.... ');
                window.FB.api('/me', function(response) { // me?fields=id,name,email - option to get name and email of fb acc
                    console.log('Good to see you, ' + response.name + '.');
                    this.props.onLoginSuccess();
                }.bind(this));
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    }

    render() {
        return (
            <div className='bg-[#915f78] min-h-screen flex items-center justify-center'>
                <div className='flex flex-col w-[25%] bg-[#ffffff] p-10 rounded-lg shadow-lg text-center'>

                    <h2 className='text-3xl font-extrabold mb-10  text-[#882054]'>Log In</h2>

                    <div className='flex flex-col items-center'>
                        <input 
                            className='username border border-black border-s-4 p-2 mb-7 w-[90%] rounded-md focus:outline-none' 
                            type="text" 
                            placeholder='Username'
                        /> 

                        <input 
                            className='userpass border border-black border-s-4 p-2 mb-[10%] w-[90%] rounded-md focus:outline-none' 
                            type="password" 
                            placeholder='Password'
                        />

                        <button className='w-[90%] bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f] mb-[10%]'>Log In</button>

                    </div>
                    
                    
                    <div className='flex flex-col w-[90%] mx-auto line h-0.5 bg-[#000000] mb-[10%]'></div>
                    
                    <div className='flex flex-col items-center'>
                        <button 
                            onClick={this.handleFBLogin} 
                            className='w-[90%] bg-[#386c91] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#4a87ad] mb-4'
                        >
                            Log in with Facebook
                        </button>
                        <button 
                            onClick={this.props.onCreateAccount} 
                            className='w-[90%] bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f]'
                        >
                            Create an Account
                        </button>
                    </div>
                    
                </div>
            </div>
        );
    }
}

export default LogIn;