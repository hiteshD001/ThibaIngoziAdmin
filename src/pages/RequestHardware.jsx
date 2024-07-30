import { useState } from "react";
import "../css/RequestHardware.css";
import sosHardware from "../assets/images/soshardware.png";

const RequestHardware = () => {
  const [quantity, setQuantity] = useState(1);
  const price = 100;

  return (
    <div className="reqhardware-container">
      <div className="wrapper">
        <h3 className="heading">Request Hardware</h3>
        <img src={sosHardware} />
        <span>
          <p className="title">Name</p>
          <h2 className="name">Kenneth C. King</h2>
        </span>
        <span>
          <p className="title">Delivery Address</p>
          <p className="address">
            Alameda dos Palmitos, 332, <br /> Randburg, Johannesburg
          </p>
        </span>

        <div className="price-container">
          <div className="quantity">
            <p onClick={() => setQuantity((p) => p - 1)}>-</p>
            <p>{quantity}</p>
            <p onClick={() => setQuantity((p) => p + 1)}>+</p>
          </div>

          <h1 className="price">{quantity * price}</h1>
        </div>

        <form action="https://sandbox.payfast.co.za/eng/process" method="post">
          <input type="hidden" name="merchant_id" value="10000100" />
          <input type="hidden" name="merchant_key" value="46f0cd694581a" />
          <input
            type="hidden"
            name="return_url"
            value="http://localhost:5173/payment-suceed"
          />
          <input type="hidden" name="amount" value={quantity * price} />
          <input type="hidden" name="item_name" value="Test Item" />
          <button className="paybutton" type="submit">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestHardware;
