import "../css/RequestHardware.css";
import sosHardware from "../assets/images/soshardware.png";
import { useEffect, useState } from "react";

const RequestHardware = () => {
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qty = params.get("qty");
    const addr = params.get("address");
    const user = params.get("username");
    const tkn = params.get("token");
    const product_name = params.get("product");
    const product_price = params.get("price");

    if (qty) setQuantity(parseInt(qty, 10));
    if (addr) setAddress(addr);
    if (user) setUsername(user);
    if (tkn) setToken(tkn);
    if (product_name) setProduct(product_name);
    if (product_price) setPrice(product_price);
  }, []);

  // const price = 100;

  return (
    <div className="reqhardware-container">
      <div className="wrapper">
        <h3 className="heading">Request Hardware</h3>
        <img src={sosHardware} />
        <span>
          <p className="title">Name</p>
          <h2 className="name">{username}</h2>
        </span>
        <span>
          <p className="title">Delivery Address</p>
          <p className="address">{address}</p>
        </span>

        <div className="price-container">
          <div className="quantity">
            <p>Quantity : {quantity}</p>
          </div>

          <h1 className="price">{quantity * price}</h1>
        </div>

        <form action={import.meta.env.VITE_PAYFAST_ACTION_URL} method="post">
          <input
            type="hidden"
            name="merchant_id"
            value={import.meta.env.VITE_MERCHANT_ID}
          />
          <input
            type="hidden"
            name="merchant_key"
            value={import.meta.env.VITE_MERCHANT_KEY}
          />
          <input
            type="hidden"
            name="return_url"
            value={`${import.meta.env.VITE_WEB_BASE_URL}/payment-suceed?qty=${quantity}&address=${address}&token=${token}`}
          />
          {/* <input
            type="hidden"
            name="cancel_url"
            value={`${import.meta.env.VITE_WEB_BASE_URL}}/payment-failed`}
          /> */}
          <input type="hidden" name="amount" value={quantity * price} />
          <input type="hidden" name="item_name" value={product} />
          <button className="paybutton" type="submit">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestHardware;
