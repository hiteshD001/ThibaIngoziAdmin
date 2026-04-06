import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Select,
  MenuItem
} from "@mui/material";
import { toast } from 'react-toastify';
import { useSaveTagPurchasedVerification,useGetUser } from "../../API Calls/API";
import moment from "moment";
import logo3 from "../../assets/images/logo3.svg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SubscriptionDetails({ subscriptionDetailsProps}) {
  
  const [subscriptionDetails, setsubscriptionDetails] = useState(subscriptionDetailsProps);
  const [latestUpdate, setLatestUpdate] = useState(subscriptionDetails?.subscriptionDetailsUpdate);
  const subscriptionData = [
    { label: "Subscription", value: subscriptionDetails?.subscription_status, type: "status-active" },
    { label: "Subscription Start", value: subscriptionDetails?.subscription_start || "12 Jan 2023" },
    { label: "Subscription End", value: subscriptionDetails?.subscription_end || "12 Jan 2024" },
    { label: "Physical Panic Button", value: subscriptionDetails?.physicalPanicButton, type: "status-purchased" },
    { label: "Order Date", value: subscriptionDetails?.orderDate },
    { label: "Order Number", value: subscriptionDetails?.orderNumber, type: "link" },
    { label: "Approved Driver", value: subscriptionDetails?.approvedDriver === true ? 'Yes' : 'No', type: "dropdown" },
    { label: "Approved By", value: subscriptionDetails?.approvedBy },
    { label: "Date Approved", value: subscriptionDetails?.dateApproved },
  ];

  const [subscriptionValue, setsubscriptionValue] = useState(subscriptionDetails?.approvedDriver === true ? 'Yes' : 'No');
  const onSuccess = () => {
    toast.success("Status Updated Successfully.");
  };
  const onError = (error) => {
    toast.error(
      error.response.data.message || "Something went Wrong",
    );
  };

  const { mutate } = useSaveTagPurchasedVerification(onSuccess, onError);

  // APi Calling
  const userID = localStorage.getItem("userID")
  const userinfo = useGetUser(localStorage.getItem("userID"));
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setsubscriptionValue(value)
    if(!subscriptionDetails.subscription_id){
      toast.error(
        "Your Not Purchase Subscription",
      );
      return
    }
    
    let saveObj = {
      driver_id: subscriptionDetails.driver_id,
      approvedBy_id: userID,
      subscription_id: subscriptionDetails.subscription_id,
      isApprovedDriver: value == 'Yes' ? true : false,
      date_approved: new Date
    }
    mutate(saveObj)
    const first_name = userinfo.data?.data.user?.first_name || "-";
    const last_name = userinfo.data?.data.user?.last_name || "-";
    const updatedData = {
      ...subscriptionDetails,
      approvedDriver: value === 'Yes',
      approvedBy:first_name +'-'+ last_name,
      dateApproved: moment().format("DD MMM YYYY, hh:mm A"),
    };
    setLatestUpdate(moment().fromNow())

    setsubscriptionDetails(updatedData);
  }

  const RowValue = ({ value, type }) => {
    if (type === "status-active") {
      if (value) {
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={600}
            sx={{ color: "#16A34A" }}
          >
            Active
          </Typography>
        );

      } else {
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={600}
            sx={{ color: "#E5565A" }}
          >
            InActive
          </Typography>
        );
      }
    }
    if (type === "status-purchased") {
      if (value === 'Purchased') {
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={600}
            sx={{ color: "#16A34A" }}
          >
            {value}
          </Typography>
        );
      } else {
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={600}
            sx={{ color: "#E5565A" }}
          >
            {value}
          </Typography>
        );
      }
    }
    if (type === "link") {
      return (
        <Typography
          fontSize="0.875rem"
          sx={{
            color: value && value !== '-' ? "#2563EB" : "#9CA3AF",
            cursor: value && value !== '-' ? "pointer" : "not-allowed",
            pointerEvents: value && value !== '-' ? "auto" : "none",
            "&:hover": value && value !== '-' ? { textDecoration: "underline" } : {}
          }}
          onClick={() => {
            if (value && value !== '-') {
              handleGeneratePdf();
            }
          }}
        >
          {value || "-"}
        </Typography>
      );
    }
    if (type === "dropdown") {
      return (
        <Select
          name="subscription"
          value={subscriptionValue}
          onChange={handleChange}
          label="Subscription"
          sx={{
            m: "0px",
            p: "0px",
            height: "0px",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >

          <MenuItem value={'No'} selected>
            No
          </MenuItem>
          <MenuItem value={'Yes'} >
            Yes
          </MenuItem>

        </Select>
      );
    }
    return (
      <Typography fontSize="0.875rem" color="text.primary">
        {value}
      </Typography>
    );
  };

  const handleGeneratePdf = () => {
    const sales_order_obj = subscriptionDetails.sales_order_details || {};

    const phoneHtml = (sales_order_obj.contact?.phones || [])
      .map(d => `<div style="font-size:12px;color:#444;margin-top:2px;">${d.number}</div>`)
      .join('');

    const productRowsHtml = (sales_order_obj.items || [])
      .map(item => `
      <tr>
        <td style="padding:12px 0;vertical-align:middle;border-bottom:1px solid #eee;">
          <div style="font-size:12px;color:#1a6fa8;font-weight:bold;line-height:1.4;">
            ${item.product?.name || '-'}
          </div>
        </td>
        <td style="text-align:center;font-size:12px;color:#444;padding:12px 6px;border-bottom:1px solid #eee;vertical-align:middle;">
          ${item.quantity}
        </td>
        <td style="text-align:right;font-size:12px;color:#444;padding:12px 6px;border-bottom:1px solid #eee;vertical-align:middle;">
          ZAR ${parseFloat(item.price_incl_tax || 0).toFixed(2)}
        </td>
        <td style="text-align:right;font-size:12px;color:#444;padding:12px 0 12px 6px;border-bottom:1px solid #eee;vertical-align:middle;">
          ZAR ${parseFloat(item.price_incl_tax || 0).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const subtotal = parseFloat(sales_order_obj.items[0].price_incl_tax || 0).toFixed(2);
    const shipping = parseFloat(sales_order_obj.shipping?.charge?.amount_incl_tax || 0).toFixed(2);
    const grandTotal = (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2);

    fetch(logo3)
      .then(res => res.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .then(logoDataUrl => {

        // 1. Create a hidden div and inject the HTML into the current DOM
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '794px';
        container.style.background = '#ffffff';
        container.style.zIndex = '-1';

        container.innerHTML = `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
          style="max-width:620px;margin:0 auto;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;">

          <!-- HEADER -->
          <tr>
            <td style="text-align:center;padding:24px 20px 12px 20px;border-bottom:1px solid #ddd;">
              <img src="${logoDataUrl}" alt="Logo" style="max-height:60px;max-width:200px;" />
              <div style="font-size:11px;color:#555;margin-top:8px;">
                Irene Link Precinct, Building E.5 Impala Ave Doringkloof, Centurion Gauteng, 0157
              </div>
              <div style="font-size:11px;color:#555;margin-top:3px;">
                Phone: +27 12 007 3660 &nbsp;|&nbsp;
                <a href="mailto:tiapp@smartops.solutions" style="color:#1a6fa8;text-decoration:none;">tiapp@smartops.solutions</a>
              </div>
            </td>
          </tr>

          <!-- ORDER REFERENCE BAR -->
          <tr>
            <td style="background-color:#f2f2f2;padding:10px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;color:#555;">
                    Related to Order # <strong style="color:#1a6fa8;">${sales_order_obj.display_id || '-'}</strong>
                  </td>
                  <td style="text-align:right;font-size:12px;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="text-align:center;padding:30px 20px 6px 20px;">
              <div style="font-size:22px;font-weight:bold;color:#222;letter-spacing:1px;">ORDER CONFIRMATION</div>
              <div style="font-size:12px;color:#555;margin-top:6px;">Ref #: ${sales_order_obj.display_id || '-'}</div>
              <div style="font-size:12px;color:#555;margin-top:3px;">${subscriptionDetails.orderDate || ''}</div>
            </td>
          </tr>

          <!-- BILLING & CONTACT DETAILS -->
          <tr>
            <td style="padding:24px 20px 0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:10px;">
                    <div style="font-size:12px;font-weight:bold;color:#222;margin-bottom:6px;">BILLING DETAILS</div>
                    <div style="font-size:12px;color:#444;">
                      ${sales_order_obj.contact?.first_name || ''} ${sales_order_obj.contact?.last_name || ''}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:10px;">
                    <div style="font-size:12px;font-weight:bold;color:#222;margin-bottom:6px;">CONTACT DETAILS</div>
                    <div style="font-size:12px;color:#444;">
                      <a href="mailto:${sales_order_obj.contact?.email || ''}" style="color:#1a6fa8;text-decoration:none;">
                        ${sales_order_obj.contact?.email || ''}
                      </a>
                    </div>
                    ${phoneHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BILLING & SHIPPING ADDRESS -->
          <tr>
            <td style="padding:20px 20px 0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:10px;">
                    <div style="font-size:12px;font-weight:bold;color:#222;margin-bottom:6px;">BILLING ADDRESS</div>
                    <div style="font-size:12px;color:#444;line-height:1.6;">
                      ${sales_order_obj.billing?.address?.line1 || ''}<br/>
                      ${sales_order_obj.billing?.address?.city || ''}<br/>
                      ${sales_order_obj.billing?.address?.state || ''}<br/>
                      ${sales_order_obj.billing?.address?.country || ''}<br/>
                      ${sales_order_obj.billing?.address?.country_name || ''}<br/>
                      ${sales_order_obj.billing?.address?.code || ''}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:10px;">
                    <div style="font-size:12px;font-weight:bold;color:#222;margin-bottom:6px;">SHIPPING ADDRESS</div>
                    <div style="font-size:12px;color:#444;line-height:1.6;">
                      ${sales_order_obj.shipping?.address?.line1 || ''}<br/>
                      ${sales_order_obj.shipping?.address?.city || ''}<br/>
                      ${sales_order_obj.shipping?.address?.state || ''}<br/>
                      ${sales_order_obj.shipping?.address?.country || ''}<br/>
                      ${sales_order_obj.shipping?.address?.country_name || ''}<br/>
                      ${sales_order_obj.shipping?.address?.code || ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRODUCTS TABLE -->
          <tr>
            <td style="padding:24px 20px 0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;font-weight:bold;color:#222;padding:8px 0;border-top:1px solid #ccc;border-bottom:1px solid #ccc;width:55%;">PRODUCTS</td>
                  <td style="font-size:12px;font-weight:bold;color:#222;padding:8px 6px;border-top:1px solid #ccc;border-bottom:1px solid #ccc;text-align:center;width:15%;">QTY</td>
                  <td style="font-size:12px;font-weight:bold;color:#222;padding:8px 6px;border-top:1px solid #ccc;border-bottom:1px solid #ccc;text-align:right;width:15%;">PRICE</td>
                  <td style="font-size:12px;font-weight:bold;color:#222;padding:8px 0 8px 6px;border-top:1px solid #ccc;border-bottom:1px solid #ccc;text-align:right;width:15%;">TOTAL</td>
                </tr>

                ${productRowsHtml}

                <tr>
                  <td colspan="2" style="padding:10px 0;"></td>
                  <td style="text-align:right;font-size:12px;font-weight:bold;color:#222;padding:8px 6px 4px 0;">TOTAL</td>
                  <td style="text-align:right;font-size:12px;color:#444;padding:8px 0 4px 6px;">ZAR ${subtotal}</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td style="text-align:right;font-size:12px;font-weight:bold;color:#222;padding:4px 6px 4px 0;">SHIPPING</td>
                  <td style="text-align:right;font-size:12px;color:#444;padding:4px 0 4px 6px;">ZAR ${shipping}</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td style="text-align:right;font-size:13px;font-weight:bold;color:#222;padding:8px 6px 4px 0;border-top:1px solid #ccc;">GRAND TOTAL</td>
                  <td style="text-align:right;font-size:13px;font-weight:bold;color:#222;padding:8px 0 4px 6px;border-top:1px solid #ccc;">ZAR ${grandTotal}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER BANNER -->
          <tr>
            <td style="padding:24px 20px 0 20px;">
              <div style="background-color:#f2f2f2;text-align:center;padding:12px;font-size:12px;color:#555;border-radius:3px;">
                Best shopping experience @
                <a href="https://thibaingozi.com" style="color:#1a6fa8;text-decoration:none;">thibaingozi.com</a>
              </div>
            </td>
          </tr>

          <!-- FOOTER CONTACT -->
          <tr>
            <td style="padding:24px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40%" style="vertical-align:middle;">
                    <img src="${logoDataUrl}" alt="Logo" style="max-height:50px;max-width:160px;" />
                  </td>
                  <td width="60%" style="vertical-align:middle;font-size:11px;color:#555;line-height:1.8;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;">
                      <tr>
                        <td style="font-weight:bold;">email:</td>
                        <td><a href="mailto:tiapp@smartops.solutions" style="color:#1a6fa8;text-decoration:none;">tiapp@smartops.solutions</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">phone:</td>
                        <td>+27 12 007 3660</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">website:&nbsp;</td>
                        <td><a href="https://thibaingozi.com" style="color:#1a6fa8;text-decoration:none;">thibaingozi.com</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="text-align:center;font-size:11px;color:#aaa;margin-top:18px;border-top:1px solid #eee;padding-top:12px;">
                Powered by Thiba Ingozi.
              </div>
            </td>
          </tr>

        </table>
      `;

        // Append hidden container to DOM so html2canvas can render it
        document.body.appendChild(container);

        // Use html2canvas to capture the container as image
        html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794,
        }).then(canvas => {

          // 4. Remove the hidden container from DOM
          document.body.removeChild(container);

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
          const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm

          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          // 5. Add first page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          // 6. Add extra pages if content overflows one page
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          // 7. Open PDF in new tab
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        });
      });
  };

  useEffect(() => {
    setsubscriptionDetails(subscriptionDetailsProps);
    setLatestUpdate(subscriptionDetailsProps?.subscriptionDetailsUpdate);
    setsubscriptionValue(subscriptionDetailsProps?.approvedDriver === true ? 'Yes' : 'No');
  }, [subscriptionDetailsProps]);

  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
          Subscription Details
        </Typography>
        <Box sx={{ px: 3, backgroundColor: "#F9FAFB", borderRadius: "10px", p: 1 }}>
          <Typography fontSize="0.75rem" color="text.secondary">
            Last updated: {latestUpdate}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#F3F4F6" }} />
      {/* Table rows */}
      <Box sx={{ px: 3, backgroundColor: "#F9FAFB", borderRadius: "16px", p: 3, mt: 3 }}>
        {subscriptionData.map((row, index) => (
          <React.Fragment key={row.label}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.75,
              }}
            >
              <Typography
                fontSize="0.875rem"
                color="text.secondary"
                sx={{ minWidth: 180 }}
              >
                {row.label}
              </Typography>
              <RowValue value={row.value} type={row.type} />
            </Box>
            {index < subscriptionData.length - 1 && (
              <Divider sx={{ borderColor: "#F3F4F6" }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </>
  );
}
