import { useNavigate } from "react-router-dom";

const PaymentExpired = () => {
    const navigate = useNavigate();

    return (
        <div className="sucess-container">
            <div>
                <div className="failed-icon">⌛</div>
                <h1>Payment Expired</h1>
                <p>Your payment session has expired. Please try again.</p>
            </div>
        </div>
    );
};

export default PaymentExpired;
