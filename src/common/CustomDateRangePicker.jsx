// CustomDateRangePicker.jsx
import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    ClickAwayListener,
    Typography,
    Popper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const CustomDateRangePicker = ({
    value,
    onChange,
    borderColor = 'rgb(175, 179, 189)',
    buttonLabel = 'Select Date Range',
    icon,
    buttonSx = {},
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const popperOpen = Boolean(anchorEl);
    const buttonRef = useRef(null);

    const handleToggle = () => {
        setAnchorEl(popperOpen ? null : buttonRef.current);
    };

    const handleClickAway = () => {
        setAnchorEl(null);
    };

    return (
        <Box position="relative">
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box>
                    <Button
                        ref={buttonRef}
                        onClick={handleToggle}
                        variant="outlined"
                        sx={{
                            height: '40px',
                            width: '240px',
                            borderRadius: '8px',
                            borderWidth: '1px',
                            justifyContent: 'space-between',
                            borderColor: borderColor,
                            borderStyle: 'solid',
                            '&:hover': {
                                borderColor: borderColor,
                            },
                            ...buttonSx,
                        }}
                        endIcon={<ExpandMoreIcon />}
                    >
                        {icon && <img src={icon} alt="calendar" style={{ marginRight: 8 }} />}
                        <Typography variant="body2" sx={{ textTransform: 'none' }}>
                            {`${format(value[0].startDate, 'dd MMM yy')} - ${format(value[0].endDate, 'dd MMM yy')}`}
                        </Typography>
                    </Button>

                    <Popper
                        open={popperOpen}
                        anchorEl={anchorEl}
                        placement="bottom-end"
                        sx={{ zIndex: 10, mt: 1 }}
                    >
                        <Box sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
                            <DateRange
                                editableDateInputs
                                onChange={(item) => onChange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={value}
                                rangeColors={["#1976d2"]}
                            />
                        </Box>
                    </Popper>
                </Box>
            </ClickAwayListener>
        </Box>
    );
};

export default CustomDateRangePicker;
