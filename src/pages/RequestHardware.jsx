import "../css/RequestHardware.css";
import sosHardware from "../assets/images/soshardware.png";
import { useSearchParams } from "react-router-dom";

const RequestHardware = () => {
  const [params] = useSearchParams()

  const address = params.get("address1") + " " + params.get("address2") + " " + params.get("city") + " " + params.get("postal_code")

  return (
    <div className="reqhardware-container">
      <div className="wrapper">
        <h3 className="heading">Request Hardware</h3>
        <img src={sosHardware} />
        <span>
          <p className="title">Name</p>
          <h2 className="name">{params.get("username")}</h2>
        </span>
        <span>
          <p className="title">Delivery Address</p>
          <table>
            <tr>
              <td className="key">Address 1:</td>
              <td className="value">{params.get("address1")}</td>
            </tr>
            <tr>
              <td className="key">Address 2:</td>
              <td className="value">{params.get("address2")}</td>
            </tr>
            <tr>
              <td className="key">City:</td>
              <td className="value">{params.get("city")}</td>
            </tr>
            <tr>
              <td className="key">Postal Code:</td>
              <td className="value">{params.get("postal_code")}</td>
            </tr>
          </table>
        </span>

        <div className="price-container">
          <div className="quantity">
            <p>Quantity : {params.get("qty")}</p>
          </div>

          <h1 className="price">{(params.get("qty") * params.get("price")).toFixed(2)}</h1>
        </div>

        <form className="form" action={import.meta.env.VITE_PAYFAST_ACTION_URL} method="post">
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
            value={`${import.meta.env.VITE_APP_URL}/payment-suceed?qty=${params.get("qty")}&address=${encodeURIComponent(address)}&token=${params.get("token")}`}
          />
          {/* <input
            type="hidden"
            name="cancel_url"
            value={`${import.meta.env.VITE_WEB_BASE_URL}}/payment-failed`}
          /> */}
          <input type="hidden" name="amount" value={params.get("qty") * params.get("price")} />
          <input type="hidden" name="item_name" value={params.get("product")} />
          <button className="paybutton" type="submit">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestHardware;
