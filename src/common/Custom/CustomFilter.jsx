import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
} from '@mui/material';
import {
    useGetCountryList,
    useGetProvinceList,
    useGetCityList
} from '../../API Calls/API';
import filter from '../../assets/images/filter.svg';

const CustomFilter = ({ onApply }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [filters, setFilters] = useState({
        country: '',
        province: '',
        city: '',
        suburb: '',
        // policeStation: '',
    });

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'country' ? { province: '' } : {}),
        }));
    };

    const handleApply = () => {
        if (onApply) onApply(filters);
        handleClose();
    };

    const countryList = useGetCountryList();
    const provinceList = useGetProvinceList(filters.country);
    const cityList = useGetCityList(filters.province)

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleClick}
                sx={{ height: '40px', borderRadius: '6px', display: 'flex', gap: '10px', border: '1px solid var(--light-gray)', color: 'black' }}
            >
                <img src={filter} alt="filter" />
                Filter
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, width: 300, borderRadius: '10px' } }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Country */}
                    <FormControl fullWidth size="small">
                        <InputLabel>Country</InputLabel>
                        <Select
                            name="country"
                            value={filters.country}
                            onChange={handleChange}
                            label="Country"
                        >
                            {countryList?.data?.data?.data?.map((c) => (
                                <MenuItem key={c._id} value={c._id}>
                                    {c.country_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Province - disabled until country is selected */}
                    <FormControl fullWidth size="small" disabled={!filters.country}>
                        <InputLabel>Province</InputLabel>
                        <Select
                            name="province"
                            value={filters.province}
                            onChange={handleChange}
                            label="Province"
                        >
                            {provinceList?.data?.data?.data?.map((p) => (
                                <MenuItem key={p._id} value={p._id}>
                                    {p.province_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* City */}
                    <FormControl fullWidth size="small" disabled={!filters.country || !filters.province}>
                        <InputLabel>City</InputLabel>
                        <Select
                            name="city"
                            value={filters.city}
                            onChange={handleChange}
                            label="City"
                        >
                            {cityList?.data?.data?.data?.map((p) => (
                                <MenuItem key={p._id} value={p._id}>
                                    {p.city_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Suburb */}
                    <FormControl fullWidth size="small">
                        <InputLabel>Suburb</InputLabel>
                        <Select
                            name="suburb"
                            value={filters.suburb}
                            onChange={handleChange}
                            label="Suburb"
                        >
                            <MenuItem value="Option1">Option 1</MenuItem>
                            <MenuItem value="Option2">Option 2</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Police Station */}
                    {/* <FormControl fullWidth size="small">
                        <InputLabel>Police Station</InputLabel>
                        <Select
                            name="policeStation"
                            value={filters.policeStation}
                            onChange={handleChange}
                            label="Police Station"
                        >
                            <MenuItem value="Option1">Option 1</MenuItem>
                            <MenuItem value="Option2">Option 2</MenuItem>
                        </Select>
                    </FormControl> */}

                    {/* Apply Button */}
                    <Button variant="contained" onClick={handleApply}>
                        Apply
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default CustomFilter;
