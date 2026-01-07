import { Box } from "@mui/material";
import { useState } from "react";
import CustomDateRangePicker from "./Custom/CustomDateRangePicker";
import CustomFilter from "./Custom/CustomFilter";
import { useGetCountryList, useGetCityList, useGetProvinceList } from '../API Calls/API'
const defaultShow = {
    date: true,
    role: true,
    country: true,
    province: true,
    suburb: true,
    city: true,
    userType: true,
    primaryPlatform: true,
};

export const FiltersBar = ({
    range,
    setRange,
}) => {
    const handleFilterApply = () => {
        console.log("fitler applied")
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <CustomDateRangePicker value={range} onChange={setRange} />
            <CustomFilter onApply={handleFilterApply} />

        </Box>
    );
};
