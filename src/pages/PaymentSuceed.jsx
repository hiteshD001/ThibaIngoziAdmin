// import { useEffect, useState } from "react";
import "../css/PaymentSuceed.css";

const PaymentSuceed = () => {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const handlePaymentSuccess = async () => {
  //     const params = new URLSearchParams(window.location.search);
  //     const qty = params.get("qty");
  //     const street = params.get("street")
  //     const province = params.get("province")
  //     const city = params.get("city")
  //     const suburb = params.get("suburb")
  //     const postal_code = params.get("postal_code")
  //     const country = params.get("country")
  //     const token = params.get("token");
  //     const status = "order_received";
  //     const product_price = params.get("product_price");
  //     const courier_price = params.get("courier_price");
  //     const totalAmount = Number(qty) * Number(product_price) + Number(courier_price);

  //     try {
  //       const response = await fetch(
  //         `${import.meta.env.VITE_BASEURL}/payment/payment-success`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //           body: JSON.stringify({
  //             item_quantity: qty,
  //             total_amount: totalAmount,
  //             status: status,
  //             street: street,
  //             province: province,
  //             postal_code: postal_code,
  //             city: city,
  //             suburb: suburb,
  //             country: country
  //           }),
  //         }
  //       );
  //       if (response.ok) {
  //         console.log("Payment success data:", await response.json());
  //       } else {
  //         console.error(
  //           "Payment success API call failed:",
  //           response.statusText
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error in payment success API call:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   handlePaymentSuccess();
  // }, []);

  return (
    <>
      {/* {loading ? (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : ( */}
      <div className="sucess-container">
        <div>
          <div className="icon">&#10003;</div>
          <h1>Payment Successful!</h1>
          <p>
            Thank you for your purchase. Your payment was processed
            successfully.
          </p>
        </div>
      </div>
      {/* )} */}
    </>
  );
};

export default PaymentSuceed;
