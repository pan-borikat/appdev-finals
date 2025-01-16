import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onSignUpSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bday: '',
        email: '',
        username: '',
        password: '',
        verificationCode: ''
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSignUp = async () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        try {
            await axios.post('http://localhost:5000/send-verification-email', {
                email: formData.email,
                code: code,
            });
            setVerificationStatus('Verification code sent. Check your email.');
            setShowVerificationInput(true);
        } catch (error) {
            console.error('Error sending verification email:', error);
            setVerificationStatus('Error sending verification email. Try again later.');
        }
    };

    const handleVerify = async () => {
        if (formData.verificationCode === generatedCode) {
            setIsVerified(true);
            setVerificationStatus('Email verified successfully!');
    
            try {
                const response = await axios.post('http://localhost:5000/signup', {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    bday: formData.bday,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                });
    
                const { token } = response.data;
                localStorage.setItem('jwtToken', token);
                onSignUpSuccess();
                navigate('/addtask');
            } catch (error) {
                console.error('Error creating user:', error.response ? error.response.data : error);
                setVerificationStatus('Error creating user. Please try again.');
            }
        } else {
            setVerificationStatus('Invalid verification code. Please try again.');
        }
    };
    return (
        <div className="bg-gradient-to-br from-[#915f78] to-[#882054] min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-[#882054] mb-8">Sign Up</h2>
                
                <form className="space-y-4">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <input
                        type="date"
                        name="bday"
                        placeholder="Birthday"
                        value={formData.bday}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                    />
                    <button 
                        type="button"
                        onClick={handleSignUp} 
                        className="w-full bg-[#915f78] text-white py-2 rounded-md transition-colors duration-300 hover:bg-[#8d738f] focus:outline-none focus:ring-2 focus:ring-[#915f78] focus:ring-offset-2"
                    >
                        Sign Up
                    </button>
                </form>

                {verificationStatus && (
                    <div className="mt-6">
                        <div className="w-full h-px bg-gray-300 mb-4"></div>
                        <div className="bg-[#882054] text-white text-sm font-medium p-2 rounded-md">
                            {verificationStatus}
                        </div>
                    </div>
                )}
                
                {showVerificationInput && (
                    <div className="mt-6 space-y-4">
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="Verification Code"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#915f78]"
                        />
                        <button 
                            type="button"
                            onClick={handleVerify} 
                            className="w-full bg-[#915f78] text-white py-2 rounded-md transition-colors duration-300 hover:bg-[#8d738f] focus:outline-none focus:ring-2 focus:ring-[#915f78] focus:ring-offset-2"
                        >
                            Verify Email
                        </button>
                    </div>
                )}
                {isVerified && (
                    <p className="mt-4 text-green-600 font-medium text-center">
                        Email verified successfully!
                    </p>
                )}
            </div>
        </div>
    );
};

export default SignUp;
