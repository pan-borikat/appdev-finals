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
            alert('Verification email sent');
            setShowVerificationInput(true);
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Error sending verification email');
        }
    };

    const handleVerify = () => {
        if (formData.verificationCode === generatedCode) {
            setIsVerified(true);
            alert('Email verified successfully!');
            onSignUpSuccess();
            navigate('/addtask');
        } else {
            alert('Invalid verification code.');
        }
    };

    return (
        <div className='bg-[#915f78] min-h-screen flex items-center justify-center'>
            <div className='bg-[#6d597a] p-10 rounded-lg shadow-lg text-center'>
                <h2 className='text-3xl font-bold mb-5 text-white'>Sign Up</h2>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <input
                    type="date"
                    name="bday"
                    placeholder="Birthday"
                    value={formData.bday}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className='mb-2 p-2 rounded'
                />
                <button 
                    onClick={handleSignUp} 
                    className='bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f] mb-4'
                >
                    Sign Up
                </button>
                {showVerificationInput && (
                    <>
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="Verification Code"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            className='mb-2 p-2 rounded'
                        />
                        <button 
                            onClick={handleVerify} 
                            className='bg-[#915f78] text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-[#8d738f]'
                        >
                            Verify Email
                        </button>
                    </>
                )}
                {isVerified && <p className='text-white mt-4'>Email verified successfully!</p>}
            </div>
        </div>
    );
};

export default SignUp;
