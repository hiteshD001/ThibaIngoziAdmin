import "../css/RequestHardware.css";
import sosHardware from "../assets/images/soshardware.png";
import { useSearchParams } from "react-router-dom";

const RequestHardware = () => {
  const [params] = useSearchParams();

  const username = params.get("username")
  const street = params.get("street")
  const province = params.get("province")
  const city = params.get("city")
  const suburb = params.get("suburb")
  const postal_code = params.get("postal_code")
  const country = params.get("country")
  const quantity = params.get("qty")
  const price = params.get("price")
  const product = params.get("product")
  const token = params.get("token")
  const returnurl = `${import.meta.env.VITE_APP_URL}/payment-suceed?qty=${quantity}&token=${token}&street=${street}&province=${province}&city=${city}&suburb=${suburb}&postal_code=${postal_code}&country=${country}`

  return (
    <div className="reqhardware-container">
      <div className="wrapper">
        <h3 className="heading">Request Hardware</h3>
        <img src={sosHardware} alt="SOS Hardware" />
        <span>
          <p className="title">Name</p>
          <h2 className="name">{username}</h2>
        </span>
        <span>
          <p className="title">Delivery Address</p>
          <table>
            <tr>
              <td className="key">Street:</td>
              <td className="value">{street}</td>
            </tr>
            <tr>
              <td className="key">Province:</td>
              <td className="value">{province}</td>
            </tr>
            <tr>
              <td className="key">City:</td>
              <td className="value">{city}</td>
            </tr>
            <tr>
              <td className="key">Suburb:</td>
              <td className="value">{suburb}</td>
            </tr>
            <tr>
              <td className="key">Postal Code:</td>
              <td className="value">{postal_code}</td>
            </tr>
            <tr>
              <td className="key">Country:</td>
              <td className="value">{country}</td>
            </tr>
          </table>
        </span>

        <div className="price-container">
          <div className="quantity">
            <p>Quantity : {quantity}</p>
          </div>

          <h1 className="price">{(quantity * price).toFixed(2)}</h1>
        </div>
        <form
          name="PayFastPayNowForm"
          className="form"
          action={import.meta.env.VITE_PAYFAST_ACTION_URL}
          method="post"
        >
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
            value={returnurl}
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