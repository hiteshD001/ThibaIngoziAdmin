import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastOption } from '../common/ToastOptions';
import Loader from '../common/Loader';
import { reset2FA } from '../API Calls/authAPI';
import logo3 from "../assets/images/logo3.svg";
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Reset2FAPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('verifying');
    const [error, setError] = useState('');

    const effectRan = useRef(false); // Prevent double API call

    useEffect(() => {
        // Prevent duplicate runs caused by React.StrictMode
        if (effectRan.current) return;
        effectRan.current = true;

        const verifyAndReset = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setError('Invalid reset link. Please request a new one.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await reset2FA(token, email);

                if (response.success) {
                    setStatus('success');

                    toast.success('2FA has been reset successfully. You can now log in.', {
                        ...toastOption,
                        autoClose: 3000
                    });

                    setTimeout(() => navigate('/'), 3000);
                } else {
                    throw new Error(response.message || 'Failed to reset 2FA');
                }
            } catch (err) {
                console.error('Error resetting 2FA:', err);
                setStatus('error');
                setError('Invalid or expired reset link. Please request a new one.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAndReset();
    }, []); // Empty array → run only once

    if (isLoading) {
        return (
            <div className="login-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <Loader size="lg" />
                    <p className="mt-2" style={{ color: '#4B5563' }}>Verifying your request...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 d-flex justify-content-center align-items-center">
                        <div className="login-box shadow p-4 rounded bg-white col-sm-12 col-md-8 col-lg-5">
                            <div className="login-logo text-center mb-3">
                                <img src={logo3} alt="logo" />
                            </div>

                            {status === 'success' ? (
                                <div className="text-center">
                                    <div className="mb-4">
                                        <FaCheckCircle className="text-success" style={{ fontSize: '4rem' }} />
                                    </div>
                                    <h4 className="mb-3" style={{ color: '#111827', fontWeight: 600 }}>
                                        2FA Reset Successful
                                    </h4>
                                    <p className="text-muted mb-4" style={{ color: '#4B5563' }}>
                                        Two-factor authentication has been disabled for your account.
                                        You will be redirected to the login page shortly.
                                    </p>
                                    <button
                                        className="btn btn-primary d-block w-100"
                                        style={{
                                            backgroundColor: '#367BE0',
                                            fontWeight: 700,
                                            padding: '10px',
                                            fontSize: '1rem',
                                            marginTop: '1.5rem'
                                        }}
                                        onClick={() => navigate('/')}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mb-4">
                                        <FaExclamationTriangle className="text-danger" style={{ fontSize: '4rem' }} />
                                    </div>
                                    <h4 className="mb-3" style={{ color: '#111827', fontWeight: 600 }}>
                                        Reset Failed
                                    </h4>
                                    <p className="text-danger mb-4" style={{ color: '#EF4444' }}>
                                        {error}
                                    </p>
                                    <button
                                        className="btn btn-primary d-block w-100"
                                        style={{
                                            backgroundColor: '#367BE0',
                                            fontWeight: 700,
                                            padding: '10px',
                                            fontSize: '1rem',
                                            marginTop: '1rem'
                                        }}
                                        onClick={() => navigate('/')}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reset2FAPage;
