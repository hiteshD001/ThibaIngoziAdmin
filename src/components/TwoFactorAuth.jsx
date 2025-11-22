// src/components/TwoFactorAuth.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toastOption } from '../common/ToastOptions';
import Loader from '../common/Loader';
import { FaArrowLeft } from 'react-icons/fa';

const TwoFactorAuth = ({ tempToken, email, onVerificationSuccess, onBack }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (index, value) => {
        if (value === '' || /^[0-9]$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            setError('');
            
            // Move to next input
            if (value !== '' && index < 5) {
                document.getElementById(`code-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BASEURL}/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({
                    code: verificationCode,
                    email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '2FA verification failed');
            }

            onVerificationSuccess(data);
        } catch (error) {
            setError(error.message || 'Invalid verification code');
            toast.error(error.message || '2FA verification failed', toastOption);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-box shadow p-4 rounded bg-white col-sm-12 col-md-8 col-lg-5">
            <button 
                onClick={onBack}
                className="btn btn-link p-0 mb-3 d-flex align-items-center"
                style={{ textDecoration: 'none' }}
            >
                <FaArrowLeft className="me-2" /> Back to Login
            </button>
            
            <div className="text-center mb-4">
                <h4>Two-Factor Authentication</h4>
                <p className="text-muted">Enter the 6-digit code from your authenticator app</p>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-center mb-4 gap-2">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            className="form-control text-center"
                            style={{
                                width: '45px',
                                height: '60px',
                                fontSize: '24px',
                                textAlign: 'center'
                            }}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={isLoading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>
                
                <div className="d-grid">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading || code.some(c => c === '')}
                    >
                        {isLoading ? <Loader color="white" /> : 'Verify'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TwoFactorAuth;