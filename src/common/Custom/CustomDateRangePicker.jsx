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
import { startOfYear } from "date-fns";

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
                            width: '230px',
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
                        {icon && <img src={icon} alt="calendar" style={{ marginRight: 4 }} />}
                        <Typography variant="body2" sx={{ textTransform: 'none' }}>
                            {`${format(value[0].startDate, 'dd MMM yy')} - ${format(value[0].endDate, 'dd MMM yy')}`}
                        </Typography>
                    </Button>

                    <Popper
                        open={popperOpen}
                        anchorEl={anchorEl}
                        placement="bottom-end"
                        sx={{ zIndex: 2000, mt: 1 }}
                    >
                        <Box sx={{ boxShadow: 3, borderRadius: 2, gap: 3, display: 'flex', flexDirection: 'row', backgroundColor: 'white', p: 2 }}>
                            {/* Quick Select Options */}
                            <Box display="flex" flexDirection={'column'} justifyContent={'space-between'} flexWrap="wrap" gap={1} mb={2}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[
                                        { label: "Last Week", days: 7 },
                                        { label: "Last Month", days: 30 },
                                        { label: "Last 3 Months", days: 90 },
                                        { label: "Last 6 Months", days: 180 },
                                        { label: "Last 12 Months", days: 365 },
                                    ].map((option) => (
                                        <Button
                                            key={option.label}
                                            // variant="outlined"
                                            sx={{ color: 'black', justifyContent: 'flex-start' }}
                                            size="small"
                                            onClick={() => {
                                                const end = new Date();
                                                const start = new Date();
                                                start.setDate(end.getDate() - option.days);
                                                onChange([{ startDate: start, endDate: end, key: 'selection' }]);
                                                setAnchorEl(null); // optional: auto-close
                                            }}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </Box>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        const today = new Date();
                                        const start = startOfYear(today);
                                        onChange([{ startDate: start, endDate: today, key: 'selection' }]);
                                        setAnchorEl(null);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Box>

                            {/* Calendar Picker */}
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
