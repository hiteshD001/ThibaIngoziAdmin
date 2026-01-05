import { Box } from "@mui/material";
import { useState } from "react";
import CustomDateRangePicker from "./custom/CustomDateRangePicker";
import CustomFilter from "./custom/CustomFilter";
import { useGetCountryList, useGetPrimaryPlatform, useGetCityList, useGetProvinceList, useGetUserTypes } from '../Api/Api'
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
    setRole,
    setCountry,
    setProvince,
    setCity,
    setSuburb,
    setUserType,
    setPrimaryPlatform,
    show = {},
}) => {
    const mergedShow = { ...defaultShow, ...show };
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const { data: countryList } = useGetCountryList();
    const { data: provinceList } = useGetProvinceList(selectedCountry);
    // const { data: cityList } = useGetCityList(selectedProvince);
    const { data: userTypeList } = useGetUserTypes();
    const { data: primaryPlatformList } = useGetPrimaryPlatform();
    const withAllOption = (options = [], label = "All") => [
        { label, value: "" },
        ...options,
    ];

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {mergedShow.date && <CustomDateRangePicker value={range} onChange={setRange} />}
            {mergedShow.role && (
                <CustomFilter menuName="All Roles" options={["Active", "Inactive", "Pending"]} onSelect={setRole} />
            )}
            {mergedShow.country && (
                <CustomFilter
                    menuName="All Countries"
                    options={countryList?.data?.data?.map((c) => ({
                        label: c.name,
                        value: c.id,
                    })) ?? []}
                    // onSelect={setCountry}
                    onSelect={(id) => {
                        setSelectedCountry(id);
                        setCountry(id);
                        setSelectedProvince(null);
                        setProvince(null);
                        setCity(null);
                    }}
                />
            )}
            {mergedShow.province && (
                <CustomFilter
                    menuName="All Provinces"
                    options={withAllOption(
                        provinceList?.data?.data?.map((p) => ({
                            label: p.name,
                            value: p.id,
                        })) ?? [],
                        "All Provinces"
                    )}
                    onSelect={(id) => {
                        setSelectedProvince(id);
                        setProvince(id);
                        setCity(null);
                    }}
                    disabled={!selectedCountry}
                />
            )}
            {mergedShow.city && (
                <CustomFilter menuName="All Cities"
                    options={withAllOption(
                        ["CityA", "CityB", "CityC"].map(c => ({ label: c, value: c })), "All Cities"
                    )}
                    onSelect={setCity} disabled={!selectedProvince} />
            )}
            {mergedShow.userType && (
                <CustomFilter
                    menuName="User Types"
                    options={withAllOption(
                        userTypeList?.data?.data?.map((u) => ({
                            label: u.name,
                            value: u.id,
                        })) ?? [],
                        "All User Types"
                    )}
                    onSelect={setUserType}
                />
            )}
            {mergedShow.suburb && (
                <CustomFilter menuName="All Suburbs" options={withAllOption(
                    ["Suburb A", "Suburb B", "Suburb C"].map(s => ({ label: s, value: s }))
                )} onSelect={setSuburb} />
            )}
            {mergedShow.primaryPlatform && (
                <CustomFilter
                    menuName="Primary Platforms"
                    options={withAllOption(
                        primaryPlatformList?.data?.data?.map((p) => ({
                            label: p.name,
                            value: p.id,
                        })) ?? [],
                        "All Platforms"
                    )}
                    onSelect={setPrimaryPlatform}
                />
            )}
        </Box>
    );
};
