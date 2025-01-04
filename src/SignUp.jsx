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
            // alert('Verification email sent');
            setVerificationStatus('Verification code sent')
            setShowVerificationInput(true);
        } catch (error) {
            console.error('Error sending email:', error);
            // alert('Error sending verification email');
            setVerificationStatus('Error sending verification email');
        }
    };

    const handleVerify = () => {
        if (formData.verificationCode === generatedCode) {
            setIsVerified(true);
            setVerificationStatus('Email verified successfully!');
            onSignUpSuccess();
            navigate('/addtask');
        } else {
            setVerificationStatus('Invalid verification code.');
        }
    };

    return (
        <div className='bg-[#915f78] min-h-screen flex items-center justify-center'>
            <div className='flex flex-col w-[30%] bg-[#ffffff] p-10 rounded-lg shadow-lg text-center'>
                
                <h2 className='text-3xl font-bold mb-10 text-[#882054]'>Sign Up</h2>
                
                <div className='flex flex-col items-center'>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className='fname border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className='lname border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                    />
                    <input
                        type="date"
                        name="bday"
                        placeholder="Birthday"
                        value={formData.bday}
                        onChange={handleChange}
                        className='bdate border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className='email border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className='username border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className='upass border border-black border-s-4 p-2 mb-6 w-[80%] rounded-md focus:outline-none'
                    />
                    <button 
                        onClick={handleSignUp} 
                        className='w-[80%] bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f] mb-10'
                    >
                        Sign Up
                    </button>

                    

                    {verificationStatus && (
                        <> 
                            <div className='flex flex-col w-[80%] mx-auto line h-0.5 bg-[#000000] mb-10'></div>
                            <div className='flex flex-col w-[80%] mx-auto text-sm font-medium text-white justify-center line h-8 bg-[#882054] mb-2'>{verificationStatus}</div>
                        </>
                    )}
                    
                    {showVerificationInput && (
                        
                        <>
                            <input
                                type="text"
                                name="verificationCode"
                                placeholder="Verification Code"
                                value={formData.verificationCode}
                                onChange={handleChange}
                                className='border border-black border-s-4 p-2 mb-4 w-[80%] rounded-md focus:outline-none'
                            />
                            <button 
                                onClick={handleVerify} 
                                className='w-[80%] bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f]'
                            >
                                Verify Email
                            </button>
                        </>
                    )}
                    {isVerified && <p className='text-white mt-4'>Email verified successfully!</p>}
                </div>
            </div>
        </div>
    );
};

export default SignUp;
