import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
} from "@mui/material";

const subscriptionData = [
  { label: "Subscription", value: "Active", type: "status-active" },
  { label: "Subscription Start", value: "12 Jan 2023" },
  { label: "Subscription End", value: "12 Jan 2024" },
  { label: "Physical Panic Button", value: "Purchased", type: "status-purchased" },
  { label: "Order Number", value: "#ORD-2023-8892", type: "link" },
  { label: "Approved Status", value: "Yes" },
  { label: "Approved By", value: "Tshepo Mazibuko" },
  { label: "Date Approved", value: "14 Jan 2023, 09:30 AM" },
];

const RowValue = ({ value, type }) => {
  if (type === "status-active") {
    return (
      <Typography
        fontSize="0.875rem"
        fontWeight={600}
        sx={{ color: "#16A34A" }}
      >
        {value}
      </Typography>
    );
  }
  if (type === "status-purchased") {
    return (
      <Typography
        fontSize="0.875rem"
        fontWeight={600}
        sx={{ color: "#16A34A" }}
      >
        {value}
      </Typography>
    );
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
  return (
    <Typography fontSize="0.875rem" color="text.primary">
      {value}
    </Typography>
  );
};

export default function SubscriptionDetails() {
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
       <Box sx={{ px: 3 ,backgroundColor: "#F9FAFB",borderRadius:"10px",p:1 }}>
        <Typography fontSize="0.75rem" color="text.secondary">
            Last updated: Just now
        </Typography>
       </Box>
     </Box>

        <Divider sx={{ borderColor: "#F3F4F6" }} />
     {/* Table rows */}
     <Box sx={{ px: 3 ,backgroundColor: "#F9FAFB",borderRadius:"16px",p:3,mt:3 }}>
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
