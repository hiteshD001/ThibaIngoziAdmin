import React, { useState } from 'react';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Menu, Stack, IconButton, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import checkboxIcon2 from '../assets/images/checkboxIcon2.svg'
import csvIcon from '../assets/images/csvIcon.svg'
import pdfIcon from '../assets/images/pdfIcon.svg'
import excelIcon from '../assets/images/excelIcon.svg'
import UncheckedIcon2 from '../assets/images/UncheckedIcon2.svg'
import CustomDateRangePicker from '../common/CustomDateRangePicker';
import calender from '../assets/images/calender.svg';
import exportdiv from '../assets/images/exportdiv.svg';
// import exportIcon from '../assets/images/exportIcon.svg';


const CustomExportMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [location, setLocation] = useState('select');
    const [category, setCategory] = useState('select');
    const [format, setFormat] = useState('pdf');

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleExport = () => {
        if (onApply) onApply(filters);
        handleClose();
    };

    return (
        <>
            <Button
                sx={{
                    height: '40px',
                    width: '140px',
                    borderRadius: '8px',
                    border: '1px solid var(--light-gray)',
                    backgroundColor: '#F3F4F6'
                }}
                variant="outlined"
                startIcon={<img src={exportdiv} alt="export" />}
                size="small"
                onClick={handleClick}
            >
                Export
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        // p: 2,
                        width: 400,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }
                }}
            >
                <Stack spacing={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--light-gray)',
                            pb: 1,
                            mb: 1,
                            p: 1
                        }}
                    >
                        <Typography variant="h6" fontWeight="550" sx={{ px: 2 }}>
                            Export
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography>Select Date Range</Typography>
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                        </Box>
                        <FormControl fullWidth size="small" >
                            <label style={{ marginBottom: 5 }}>Select Location Filters</label>
                            <Select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                sx={{
                                    '& fieldset': {
                                        border: '1px solid var(--light-gray)',
                                    },
                                }}
                            >
                                <MenuItem value="select">Select Location</MenuItem>
                                <MenuItem value="North">North West</MenuItem>
                                <MenuItem value="Western Cape">Western Cape</MenuItem>
                                <MenuItem value="Free State">Free State</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <label style={{ marginBottom: 5 }}>Category</label>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                sx={{
                                    '& fieldset': {
                                        border: '1px solid var(--light-gray)',
                                    },
                                }}
                            >
                                <MenuItem value="select">Select Category</MenuItem>
                                <MenuItem value="Accident">Accident</MenuItem>
                                <MenuItem value="Fire">Fire</MenuItem>
                                <MenuItem value="Medical">Medical</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <FormGroup>
                                <label style={{ marginBottom: 5 }}>Export Format</label>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        mt: 1,
                                        // ml: 1.5
                                    }}
                                >
                                    <FormControlLabel
                                        sx={{
                                            backgroundColor: "#F9FAFB",
                                            border: '1px solid #E5E7EB',
                                            borderRadius: "8px",
                                            px: 2,
                                            py: 1,
                                            mr: 0,
                                            ml: 0
                                        }}
                                        control={
                                            <Checkbox
                                                checked={format === "xlsx"}
                                                onChange={() => setFormat("xlsx")}
                                                icon={<img src={UncheckedIcon2} alt='uncheckedIcon' />}
                                                checkedIcon={<img src={checkboxIcon2} alt='checkIcon' />}
                                                sx={{
                                                    '& .MuiSvgIcon-root': {
                                                        borderRadius: '50%',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <img src={excelIcon} alt="excel Icon" style={{ width: 20, height: 20 }} />
                                                <Typography fontWeight={500}>Excel (.xlsx)</Typography>
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        sx={{
                                            backgroundColor: "#F9FAFB",
                                            border: '1px solid #E5E7EB',
                                            borderRadius: "8px",
                                            px: 2,
                                            py: 1,
                                            mr: 0,
                                            ml: 0
                                        }}
                                        control={
                                            <Checkbox
                                                checked={format === "pdf"}
                                                onChange={() => setFormat("pdf")}
                                                icon={<img src={UncheckedIcon2} alt='uncheckedIcon' />}
                                                checkedIcon={<img src={checkboxIcon2} alt='checkIcon' />}
                                                sx={{
                                                    '& .MuiSvgIcon-root': {
                                                        borderRadius: '50%',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <img src={pdfIcon} alt="pdf Icon" style={{ width: 20, height: 20 }} />
                                                <Typography fontWeight={500}>PDF (.pdf)</Typography>
                                            </Box>
                                        }
                                    />

                                    <FormControlLabel
                                        sx={{
                                            backgroundColor: "#F9FAFB",
                                            border: '1px solid #E5E7EB',
                                            borderRadius: "8px",
                                            px: 2,
                                            py: 1,
                                            mr: 0,
                                            ml: 0
                                        }}
                                        control={
                                            <Checkbox
                                                checked={format === "csv"}
                                                onChange={() => setFormat("csv")}
                                                icon={<img src={UncheckedIcon2} alt='uncheckedIcon' />}
                                                checkedIcon={<img src={checkboxIcon2} alt='checkIcon' />}
                                                sx={{
                                                    '& .MuiSvgIcon-root': {
                                                        borderRadius: '50%',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <img src={csvIcon} alt="CSV Icon" style={{ width: 20, height: 20 }} />
                                                <Typography fontWeight={500}>CSV (.csv)</Typography>
                                            </Box>
                                        }
                                    />
                                </Box>
                            </FormGroup>
                        </FormControl>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: { xs: 'center', md: 'flex-end', gap: '10px' } }}>
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                sx={{ borderRadius: '6px', display: 'flex', gap: '10px', border: '1px solid var(--light-gray)', color: 'black' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleExport}
                                sx={{ borderRadius: '6px', textTransform: 'none', width: '140px', backgroundColor: 'var(--Blue)', height: '40px' }}
                            >
                                Export Report
                            </Button>

                        </Box>
                    </Box>





                </Stack>
            </Menu>
        </>
    );
};

export default CustomExportMenu;
