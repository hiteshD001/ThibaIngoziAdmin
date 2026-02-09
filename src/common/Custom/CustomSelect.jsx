// src/common/CustomSelect.jsx
import React from 'react';
import { FormControl, Select, MenuItem, FormHelperText } from '@mui/material';

const CustomSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    helperText,
    ...props
}) => (
    <FormControl fullWidth error={!!error}>
        {label && <label style={{ marginBottom: 4 }}>{label}</label>}
        <Select
            name={name}
            value={value}
            onChange={onChange}
            displayEmpty
            sx={{
                height: 44,
                mt: '3px',
                '& .MuiSelect-select': {
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E3E7 !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E3E7 !important',
                },
                '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E3E7 !important',
                    },
                    boxShadow: 'none',
                },
            }}
            {...props}
        >
            <MenuItem value="">
                <em>Select {label}</em>
            </MenuItem>
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}

    </FormControl>
);

export default CustomSelect;