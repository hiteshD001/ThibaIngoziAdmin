import { useEffect } from "react";
import "../css/PaymentSuceed.css";

const PaymentSuceed = () => {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("paymentId");

  useEffect(() => {
    // If opened in a popup/tab by the enrolment dialog, close after a short delay
    // so the parent admin page gets focus back.
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="sucess-container">
        <div>
          <div className="icon">&#10003;</div>
          <h1>Enrolment Payment Successful!</h1>
          <p>
            The payment was processed successfully. Enrolment has been
            activated for the user.
          </p>
          {paymentId && (
            <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "8px" }}>
              Reference: {paymentId}
            </p>
          )}
          {window.opener && (
            <p style={{ fontSize: "0.85rem", color: "#888" }}>
              This tab will close automatically…
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSuceed;
