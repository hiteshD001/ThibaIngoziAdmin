import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="sucess-container">
            <div>
                <div className="failed-icon">✖</div>
                <h1>Payment Failed</h1>
                <p>Oops! Something went wrong. Please try again.</p>
            </div>
        </div>
    );
};

export default PaymentFailed;
