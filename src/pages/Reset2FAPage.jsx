import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastOption } from '../common/ToastOptions';
import Loader from '../common/Loader';
import { reset2FA } from '../API Calls/authAPI';
import logo3 from "../assets/images/logo3.svg";

const Reset2FAPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('verifying');
    const [error, setError] = useState('');

    useEffect(() => {
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
                        autoClose: 5000
                    });
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    throw new Error(response.message || 'Failed to reset 2FA');
                }
            } catch (error) {
                console.error('Error resetting 2FA:', error);
                setStatus('error');
                setError('Invalid or expired reset link. Please request a new one.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAndReset();
        // Remove verifyAndReset from dependency array to prevent double calls
    }, [searchParams, navigate]); // Remove verifyAndReset from here

    if (isLoading) {
        return (
            <div className="login-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <Loader size="lg" />
                    <p className="mt-2">Verifying your request...</p>
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
                            <div className="login-logo text-center mb-4">
                                <img src={logo3} alt="logo" className="mb-3" />
                                {status === 'success' ? (
                                    <>
                                        <div className="mb-4">
                                            <div className="mb-3">
                                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                                            </div>
                                            <h4 className="mb-3">2FA Reset Successful</h4>
                                            <p className="text-muted mb-4">
                                                Two-factor authentication has been disabled for your account.
                                                You will be redirected to the login page shortly.
                                            </p>
                                            <button
                                                className="btn btn-primary d-block w-100"
                                                style={{ 
                                                    backgroundColor: '#367BE0', 
                                                    fontWeight: 700,
                                                    padding: '10px',
                                                    fontSize: '1rem'
                                                }}
                                                onClick={() => navigate('/')}
                                            >
                                                Go to Login
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h4 className="mb-3">Reset Failed</h4>
                                        <p className="text-danger mb-4">{error}</p>
                                        <button
                                            className="btn btn-primary d-block w-100"
                                            style={{ 
                                                backgroundColor: '#367BE0', 
                                                fontWeight: 700,
                                                padding: '10px',
                                                fontSize: '1rem'
                                            }}
                                            onClick={() => navigate('/login')} >
                                            Back to Login
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reset2FAPage;