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
                window.FB.api('/me', function(response) {
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
                <div className='bg-[#6d597a] p-10 rounded-lg shadow-lg text-center'>
                    <h2 className='text-3xl font-bold mb-5 text-white'>Log In</h2>
                    <button 
                        onClick={this.handleFBLogin} 
                        className='bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f] mb-4'
                    >
                        Log in with Facebook
                    </button>
                    <button 
                        onClick={this.props.onCreateAccount} 
                        className='bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f]'
                    >
                        Create an Account
                    </button>
                </div>
            </div>
        );
    }
}

export default LogIn;