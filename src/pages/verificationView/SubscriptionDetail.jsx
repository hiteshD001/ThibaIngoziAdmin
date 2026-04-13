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
import Loader from "../../common/Loader";

export default function SubscriptionDetails({ subscriptionDetailsProps}) {
  
  const [subscriptionDetails, setsubscriptionDetails] = useState(subscriptionDetailsProps);
  const [latestUpdate, setLatestUpdate] = useState(subscriptionDetails?.subscriptionDetailsUpdate ? subscriptionDetails?.subscriptionDetailsUpdate : 'Not Updated');
  const [pdfLoader, setPdfLoader] = useState(false);
  const subscriptionData = [
    { label: "Subscription", value: subscriptionDetails?.subscription_status, type: "status-active" },
    { label: "Subscription Start", value: subscriptionDetails?.subscription_start || "12 Jan 2023" },
    { label: "Subscription End", value: subscriptionDetails?.subscription_end || "12 Jan 2024" },
    { label: "Physical Panic Button", value: subscriptionDetails?.physicalPanicButton, type: "status-purchased" },
    { label: "Order Date", value: subscriptionDetails?.orderDate },
    { label: "Order Number/ View Certificate", value: subscriptionDetails?.orderNumber, type: "link" },
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
            fontSize="14px"
            fontWeight={500}
            sx={{ color: "#16A34A" }}
          >
            Active
          </Typography>
        );

      } else {
        return (
          <Typography
            fontSize="14px"
            fontWeight={500}
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
            fontSize="14px"
            fontWeight={500}
            sx={{ color: "#16A34A" }}
          >
            {value}
          </Typography>
        );
      } else {
        return (
          <Typography
            fontSize="14px"
            fontWeight={500}
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
          fontSize="14px"
          fontWeight={500}
          sx={{
            color: value && value !== '-' ? "#367BE0" : "#9CA3AF",
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
      <Typography fontSize="14px" fontWeight={500} color='#4B5563'>
        {value}
      </Typography>
    );
  };

  const handleGeneratePdfOld = () => {
    setPdfLoader(true)
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
          setPdfLoader(false)
        });
      });
  };

  const handleGeneratePdf = async () => {
    const sales_order_obj = subscriptionDetails.sales_order_details || {};
    const previewWindow = window.open('', '_blank');
    const phoneHtml = (sales_order_obj.contact?.phones || [])
      .map(d => `
        <tr>
          <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            ${d.number}
          </td>
        </tr>
      `).join('');

    const productRowsHtml = (sales_order_obj.items || [])
      .map(item => `
        <tr style="border-bottom:1px solid #e0e0e0;" valign="top">
          <td width="50px" style="padding:5px 0 5px 20px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            <a href="${item.product?.url || '#'}" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
              <img src="https://thibaingozi.com/gallery/00/00/00/00000013_small.jpg" border="0" alt="" style="border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:50px;height:auto;" />
            </a>
          </td>
          <td style="padding:5px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            <a href="http://thibaingozi.com/itag-for-thiba-ingozi-app-powered-by-smartops" style="text-decoration: none; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">Thiba Ingozi Powered By SmartOps&nbsp;&nbsp;SOS ITAG POWERED BY SMARTOPS</a>
            <div style="padding-top:3px;"></div>
          </td>
          <td align="center" style="padding:5px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            ${item.quantity}
          </td>
          <td align="right" style="padding:5px;white-space:nowrap;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            R ${parseFloat(item.price_incl_tax || 0).toFixed(2)}
          </td>
          <td align="right" style="padding:5px 20px 5px 0;white-space:nowrap;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
            R ${parseFloat(item.price_incl_tax || 0).toFixed(2)}
          </td>
        </tr>
      `).join('');

    const subtotal = parseFloat(sales_order_obj.items[0].price_incl_tax || 0).toFixed(2);
    const shipping = parseFloat(sales_order_obj.shipping?.charge?.amount_incl_tax || 0).toFixed(2);
    const grandTotal = (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2);

    let logoDataUrl = 'http://thibaingozi.com/gallery/content/logo/thiba.png'
    const container = `
          <table border="0" cellpadding="0" cellspacing="5" width="600" id="emailBody"
            style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#FFFFFF;border:1px solid #DDDDDD;border-radius:4px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">

            <!-- HEADER: LOGO + ADDRESS -->
            <tr>
              <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr align="center">
                    <td valign="top" style="padding:20px 0 10px 0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-bottom:10px;">
                      <img src="${logoDataUrl}" alt="Logo" style="max-width:250px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;height:auto;" /><br/>
                      <div style="color:#404040;font-size:13px;line-height:150%;text-align:center;padding-bottom:10px;">
                        Irene Link Precinct, Building E 5 Impala Ave Doringkloof, Centurion Gauteng, 0157<br/>
                        Phone: +27 12 007 3660 &nbsp;&nbsp;|&nbsp;&nbsp;
                        <a href="mailto:tiapp@smartops.solutions" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">tiapp@smartops.solutions</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ORDER REFERENCE BAR -->
            <tr>
              <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <table border="0" cellpadding="0px" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td align="left" valign="top" style="padding:0 20px 0 20px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#E0E0E0"
                        style="border-radius:4px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td valign="top" width="600" style="padding-top:10px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-right:20px;padding-left:20px;">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="260" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-bottom:10px;color:#404040;font-size:14px;line-height:125%;text-align:left;">
                                  <strong>Related to Order # ${sales_order_obj.display_id || '-'}</strong>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <br/><br/>

                <!-- TITLE -->
                <table width="600" border="0" align="center" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr style="margin-bottom:5px;">
                    <td align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <h1 style="margin:0;padding:0;color:#202020;font-size:24px;line-height:150%;">ORDER CONFIRMATION-CERTIFICATE</h1>
                    </td>
                  </tr>
                  <tr height="20px" style="color:#404040;font-size:15px;line-height:150%;text-align:center;padding-bottom:10px;">
                    <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      Ref #: ${sales_order_obj.display_id || '-'}
                    </td>
                  </tr>
                  <tr style="color:#404040;font-size:13px;line-height:150%;text-align:center;padding-bottom:10px;">
                    <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      ${subscriptionDetails.orderDate || ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BILLING & CONTACT DETAILS -->
            <tr>
              <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <br/><br/>
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td valign="top" width="600" style="padding:0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">

                            <!-- BILLING DETAILS -->
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="320" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="padding-bottom:20px;line-height:150%;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:14px;">
                                  <h5 style="padding-bottom:5px;margin:0;padding:0;color:#202020;font-size:14px;line-height:150%;">BILLING DETAILS</h5>
                                  <table width="99%" border="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                        ${sales_order_obj.contact?.first_name || ''} ${sales_order_obj.contact?.last_name || ''}
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                               <tr>
                                <td valign="top" style="padding-bottom:20px;line-height:150%;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:14px;">
                                  <h5 style="padding-bottom:5px;margin:0;padding:0;color:#202020;font-size:14px;line-height:150%;">PASSPORT NUMBER</h5>
                                  <table width="99%" border="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                      ${sales_order_obj.custom_fields?.id_number || ''}
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!-- CONTACT DETAILS -->
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="280" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="padding-bottom:20px;line-height:150%;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:14px;">
                                  <h5 style="padding-bottom:5px;margin:0;padding:0;color:#202020;font-size:14px;line-height:150%;">CONTACT DETAILS</h5>
                                  <table width="99%" border="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                        ${sales_order_obj.contact?.email || ''}
                                      </td>
                                    </tr>
                                    ${phoneHtml}
                                  </table>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- BILLING & SHIPPING ADDRESS -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td valign="top" width="600" style="padding:0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">

                            <!-- BILLING ADDRESS -->
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="320" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="padding-bottom:20px;line-height:150%;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:14px;">
                                  <h5 style="padding-bottom:5px;margin:0;padding:0;color:#202020;font-size:14px;line-height:150%;">BILLING ADDRESS</h5>
                                  <table width="99%" border="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.billing?.address?.line1 || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.billing?.address?.city || ''}&nbsp; ${sales_order_obj.billing?.address?.code || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.billing?.address?.state || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.billing?.address?.country_name || sales_order_obj.billing?.address?.country || ''}</td></tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- SHIPPING ADDRESS -->
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="280" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="padding-bottom:20px;line-height:150%;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:14px;">
                                  <h5 style="padding-bottom:5px;margin:0;padding:0;color:#202020;font-size:14px;line-height:150%;">SHIPPING ADDRESS</h5>
                                  <table width="99%" border="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.shipping?.address?.line1 || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.shipping?.address?.city || ''}&nbsp; ${sales_order_obj.shipping?.address?.code || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.shipping?.address?.state || ''}</td></tr>
                                    <tr><td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">${sales_order_obj.shipping?.address?.country_name || sales_order_obj.shipping?.address?.country || ''}</td></tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- PRODUCTS TABLE -->
                <table border="0" cellpadding="5px" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">
                      <table border="0" cellpadding="10px" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td align="center" valign="top" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <thead>
                                <tr align="center" style="border-bottom:1px solid #e0e0e0;">
                                  <th colspan="2" align="left" style="padding:5px 0 5px 20px;">PRODUCTS</th>
                                  <th width="50px" align="center" style="padding:5px;">QTY</th>
                                  <th width="80px" align="right" style="padding:5px;">PRICE</th>
                                  <th width="80px" align="right" style="padding:5px 20px 5px 0;">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${productRowsHtml}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colspan="4" align="right" style="padding:5px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">TOTAL</td>
                                  <td align="right" style="white-space:nowrap;padding:5px 20px 5px 0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">R ${subtotal}</td>
                                </tr>
                                <tr>
                                  <td colspan="4" align="right" style="padding:5px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">SHIPPING</td>
                                  <td align="right" style="white-space:nowrap;padding:5px 20px 5px 0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">R ${shipping}</td>
                                </tr>
                                <tr>
                                  <td colspan="4" align="right" style="padding:5px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;"><strong>GRAND TOTAL</strong></td>
                                  <td align="right" style="padding:5px 20px 5px 0;white-space:nowrap;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <strong>R ${grandTotal}</strong>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- FOOTER BANNER -->
                <table border="0" cellpadding="0px" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td align="center" valign="top" style="padding:0 20px 0 20px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#E0E0E0"
                        style="border-radius:4px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td valign="top" width="600" style="padding-top:10px;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-right:20px;padding-left:20px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-bottom:10px;color:#404040;font-size:14px;line-height:125%;">
                                  <strong>Best shopping experience @
                                    <a href="http://thibaingozi.com" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-decoration:underline;">thibaingozi.com</a>
                                  </strong>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- FOOTER CONTACT -->
            <tr>
              <td align="center" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                  <tr>
                    <td valign="top" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">
                      <hr align="center" width="100%" size="1" color="#CCCCCC" noshade="" />
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                        <tr>
                          <td valign="top" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-top:0;padding-right:20px;padding-left:20px;">

                            <!-- Logo left -->
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="250" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:13px;line-height:125%;text-align:left;padding-bottom:10px;">
                                  <br/>
                                  <img src="${logoDataUrl}" alt="Logo" style="max-width:200px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;height:auto;" />
                                </td>
                              </tr>
                            </table>

                            <!-- Contact right -->
                            <table align="right" border="0" cellpadding="0" cellspacing="0" width="250" style="margin-top:0;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                              <tr>
                                <td valign="top" style="padding-bottom:0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#404040;font-size:13px;line-height:125%;text-align:left;">
                                  <table width="99%" border="0" cellspacing="0" cellpadding="5px" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                                    <tr>
                                      <td align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">email:</td>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                                        <a href="mailto:tiapp@smartops.solutions" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">tiapp@smartops.solutions</a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">phone:</td>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">+27 12 007 3660</td>
                                    </tr>
                                    <tr>
                                      <td align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">website:</td>
                                      <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                                        <a href="http://thibaingozi.com" title="thibaingozi.com" target="_blank" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">thibaingozi.com</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top:0;padding-right:20px;padding-left:20px;">
                      <hr align="center" width="100%" size="1" color="#CCCCCC" noshade="" />
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" align="center" width="600" style="padding:20px 0 20px 0;mso-table-lspace:0pt;mso-table-rspace:0pt;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding-right:20px;padding-left:20px;">
                      <br/>
                      Powered by Thiba Ingozi.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        `;

    const htmlContent = `
    <html>
      <head>
        <title>Order Preview</title>
      </head>
      <body style="
    margin:0;
    padding:20px;
    font-family:Arial,sans-serif;
    background:#E0E0E0;
    display:flex;
    flex-direction:column;
    align-items:center;
  ">
     <div style="
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%, -50%) rotate(-30deg);
      font-size:60px;
      color:#000;
      opacity:0.05;
      z-index:0;
      pointer-events:none;
      white-space:nowrap;
      font-weight:bold;
    ">
      Digital Certificate
    </div>
          ${container}
       
      </body>
    </html>
  `;

    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
  };

  useEffect(() => {
    setsubscriptionDetails(subscriptionDetailsProps);
    setLatestUpdate(subscriptionDetailsProps?.subscriptionDetailsUpdate ? subscriptionDetailsProps?.subscriptionDetailsUpdate : 'Not Updated');
    setsubscriptionValue(subscriptionDetailsProps?.approvedDriver === true ? 'Yes' : 'No');
  }, [subscriptionDetailsProps]);

  return (
    <>
      {pdfLoader && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.34)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <Loader color="white" />
        </Box>
      )}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          fontFamily:'Montserrat'
        }}
      >
        <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
          Subscription Details
        </Typography>
        <Box sx={{ px: 3, backgroundColor: "#F9FAFB", borderRadius: "10px", p: 1 }}>
          <Typography fontSize="12px" fontWeight={400} color="#94A3B8">
            Last updated: {latestUpdate}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#F3F4F6" }} />
      {/* Table rows */}
      <Box sx={{ px: 3, backgroundColor: "#F9FAFB", borderRadius: "16px", p: 3, mt: 3,border:'1px solid #E2E8F0' }}>
        {subscriptionData.map((row, index) => (
          <React.Fragment key={row.label}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",  // ← fixed label col + value col
                alignItems: "center",
                py: 1.75,
                borderTop:'1px solid #F1F5F9',
                borderBottom:'1px solid #F1F5F9'
              }}
            >
              <Typography
                fontSize="14px"
                fontWeight={500}
                color="#4B5563"
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
