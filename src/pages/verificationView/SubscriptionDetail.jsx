import React, { useState } from 'react';
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


export default function SubscriptionDetails({ subscriptionDetailsProps }) {
  
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
        "Your Nor Purchase Subscription",
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
          sx={{ color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          {value}
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

  return (
    <>


      {/*  <Box sx={{ p: 3, , minHeight: "100vh" }}>
   <Paper
     elevation={2}
     sx={{
       maxWidth: 700,
       borderRadius: "12px",
       overflow: "hidden",
     //   backgroundColor: "#FFFFFF",
     }}
   >
      */}
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
      {/* </Paper>
 </Box> */}
    </>
  );
}
